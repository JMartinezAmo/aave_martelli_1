/**
 * Looping strategy implementation
 *
 * Core business logic for carry trade with leverage on Aave v3
 */

import { ethers } from 'ethers';
import { StrategyConfig } from '../../config/strategy';
import { getTokenAddress, getTokenBalance, getTokenDecimals } from '../infrastructure/contracts';
import { getSignerAddress } from '../infrastructure/provider';
import {
  getUserAccountData,
  getAssetAPYs,
  supply,
  borrow,
  repay,
  withdraw,
  printAccountStatus,
} from '../aave/aaveService';
import { swapWithSlippage, estimateAmountOut } from '../swaps/swapService';
import { InterestRateMode } from '../aave/types';
import {
  calculateSafeBorrowAmount,
  calculateRepayAmountForHF,
  isProfitableSpread,
  calculateSpreadBps,
} from './calculations';
import { logger, formatAmount, formatHealthFactor, formatBps } from '../utils/logger';

/**
 * Result of a looping operation
 */
export interface LoopingResult {
  loopsPerformed: number;
  totalCollateral: bigint;
  totalDebt: bigint;
  healthFactor: bigint;
  spreadBps: number;
}

/**
 * Open a new looping position
 *
 * @param initialCollateralAmount Amount of collateral to deposit initially
 * @param config Strategy configuration
 */
export async function openLoops(
  initialCollateralAmount: bigint,
  config: StrategyConfig
): Promise<LoopingResult> {
  logger.info('=== OPENING LOOPING POSITION ===');

  const userAddress = await getSignerAddress();
  const collateralAddress = getTokenAddress(config.collateralAsset);
  const debtAddress = getTokenAddress(config.debtAsset);

  // Get token decimals
  const [collateralDecimals, debtDecimals] = await Promise.all([
    getTokenDecimals(collateralAddress),
    getTokenDecimals(debtAddress),
  ]);

  // Check initial balance
  const balance = await getTokenBalance(collateralAddress, userAddress);
  if (balance < initialCollateralAmount) {
    throw new Error(
      `Insufficient balance. Have: ${formatAmount(balance, collateralDecimals, 2)}, Need: ${formatAmount(initialCollateralAmount, collateralDecimals, 2)}`
    );
  }

  // Step 1: Initial supply
  logger.info(`Step 1: Supplying ${formatAmount(initialCollateralAmount, collateralDecimals, 2)} ${config.collateralAsset}`);
  await supply(collateralAddress, initialCollateralAmount, config.dryRun);

  // Step 2: Check APYs and spread
  logger.info('Step 2: Checking APYs and spread');
  const [collateralAPYs, debtAPYs] = await Promise.all([
    getAssetAPYs(collateralAddress),
    getAssetAPYs(debtAddress),
  ]);

  const spreadBps = calculateSpreadBps(collateralAPYs.supplyAPY, debtAPYs.variableBorrowAPY);

  logger.info(`${config.collateralAsset} Supply APY: ${collateralAPYs.supplyAPY.toFixed(2)}%`);
  logger.info(`${config.debtAsset} Borrow APY: ${debtAPYs.variableBorrowAPY.toFixed(2)}%`);
  logger.info(`Spread: ${formatBps(spreadBps)}`);

  if (!isProfitableSpread(collateralAPYs.supplyAPY, debtAPYs.variableBorrowAPY, config.minSpreadBps)) {
    logger.warn(`Spread ${formatBps(spreadBps)} below minimum ${formatBps(config.minSpreadBps)}`);
    logger.warn('Not performing loops due to insufficient spread');

    const accountData = await getUserAccountData(userAddress);
    return {
      loopsPerformed: 0,
      totalCollateral: accountData.totalCollateralBase,
      totalDebt: accountData.totalDebtBase,
      healthFactor: accountData.healthFactor,
      spreadBps,
    };
  }

  // Step 3: Perform loops
  logger.info(`Step 3: Performing up to ${config.maxLoops} loops`);

  let loopsPerformed = 0;
  const minHealthFactorBigInt = BigInt(Math.floor(config.minHealthFactor * 1e18));

  for (let i = 0; i < config.maxLoops; i++) {
    logger.info(`\n--- Loop ${i + 1}/${config.maxLoops} ---`);

    // Get current account data
    const accountData = await getUserAccountData(userAddress);

    logger.info(`Current HF: ${formatHealthFactor(accountData.healthFactor)}`);
    logger.info(`Available to borrow: $${formatAmount(accountData.availableBorrowsBase, 8, 2)}`);

    // Calculate safe borrow amount
    const safeBorrowBase = calculateSafeBorrowAmount(
      accountData,
      config.maxLtvUsage,
      config.borrowSafetyMargin,
      minHealthFactorBigInt
    );

    if (safeBorrowBase === 0n) {
      logger.warn('No safe borrow capacity remaining');
      break;
    }

    logger.info(`Safe borrow amount: $${formatAmount(safeBorrowBase, 8, 2)}`);

    // Convert base currency to debt token amount (assume 1:1 for stablecoins)
    // In production, use proper price feeds
    const borrowAmount = safeBorrowBase * 10n ** BigInt(debtDecimals) / 10n ** 8n;

    // Borrow
    logger.info(`Borrowing ${formatAmount(borrowAmount, debtDecimals, 2)} ${config.debtAsset}`);
    await borrow(debtAddress, borrowAmount, InterestRateMode.Variable, config.dryRun);

    // Swap debt token to collateral token
    logger.info(`Swapping ${config.debtAsset} -> ${config.collateralAsset}`);
    const amountReceived = await swapWithSlippage(
      debtAddress,
      collateralAddress,
      borrowAmount,
      config.slippageBps,
      config.dryRun
    );

    // Supply the received collateral
    logger.info(`Supplying ${formatAmount(amountReceived, collateralDecimals, 2)} ${config.collateralAsset}`);
    await supply(collateralAddress, amountReceived, config.dryRun);

    loopsPerformed++;

    // Check new health factor
    const newAccountData = await getUserAccountData(userAddress);
    logger.info(`New HF: ${formatHealthFactor(newAccountData.healthFactor)}`);

    // Safety check
    if (newAccountData.healthFactor < minHealthFactorBigInt) {
      logger.error('CRITICAL: Health factor below minimum!');
      throw new Error('Health factor breach - stopping loops');
    }
  }

  // Final status
  const finalAccountData = await getUserAccountData(userAddress);

  logger.success(`\n=== LOOPING COMPLETED ===`);
  logger.info(`Loops performed: ${loopsPerformed}`);
  logger.info(`Total collateral: $${formatAmount(finalAccountData.totalCollateralBase, 8, 2)}`);
  logger.info(`Total debt: $${formatAmount(finalAccountData.totalDebtBase, 8, 2)}`);
  logger.info(`Health Factor: ${formatHealthFactor(finalAccountData.healthFactor)}`);

  return {
    loopsPerformed,
    totalCollateral: finalAccountData.totalCollateralBase,
    totalDebt: finalAccountData.totalDebtBase,
    healthFactor: finalAccountData.healthFactor,
    spreadBps,
  };
}

/**
 * Add more loops to existing position
 *
 * @param config Strategy configuration
 */
export async function addLoops(config: StrategyConfig): Promise<LoopingResult> {
  logger.info('=== ADDING LOOPS TO POSITION ===');

  const userAddress = await getSignerAddress();
  const collateralAddress = getTokenAddress(config.collateralAsset);
  const debtAddress = getTokenAddress(config.debtAsset);

  // Get token decimals
  const [collateralDecimals, debtDecimals] = await Promise.all([
    getTokenDecimals(collateralAddress),
    getTokenDecimals(debtAddress),
  ]);

  // Check current position
  const accountData = await getUserAccountData(userAddress);

  if (accountData.totalCollateralBase === 0n) {
    throw new Error('No existing position found. Use openLoops first.');
  }

  logger.info(`Current collateral: $${formatAmount(accountData.totalCollateralBase, 8, 2)}`);
  logger.info(`Current debt: $${formatAmount(accountData.totalDebtBase, 8, 2)}`);
  logger.info(`Current HF: ${formatHealthFactor(accountData.healthFactor)}`);

  // Check spread
  const [collateralAPYs, debtAPYs] = await Promise.all([
    getAssetAPYs(collateralAddress),
    getAssetAPYs(debtAddress),
  ]);

  const spreadBps = calculateSpreadBps(collateralAPYs.supplyAPY, debtAPYs.variableBorrowAPY);

  if (!isProfitableSpread(collateralAPYs.supplyAPY, debtAPYs.variableBorrowAPY, config.minSpreadBps)) {
    logger.warn(`Spread ${formatBps(spreadBps)} below minimum ${formatBps(config.minSpreadBps)}`);
    return {
      loopsPerformed: 0,
      totalCollateral: accountData.totalCollateralBase,
      totalDebt: accountData.totalDebtBase,
      healthFactor: accountData.healthFactor,
      spreadBps,
    };
  }

  // Perform additional loops (same logic as openLoops but without initial supply)
  let loopsPerformed = 0;
  const minHealthFactorBigInt = BigInt(Math.floor(config.minHealthFactor * 1e18));

  for (let i = 0; i < config.maxLoops; i++) {
    const accountData = await getUserAccountData(userAddress);

    const safeBorrowBase = calculateSafeBorrowAmount(
      accountData,
      config.maxLtvUsage,
      config.borrowSafetyMargin,
      minHealthFactorBigInt
    );

    if (safeBorrowBase === 0n) {
      logger.warn('No safe borrow capacity remaining');
      break;
    }

    const borrowAmount = safeBorrowBase * 10n ** BigInt(debtDecimals) / 10n ** 8n;

    await borrow(debtAddress, borrowAmount, InterestRateMode.Variable, config.dryRun);
    const amountReceived = await swapWithSlippage(
      debtAddress,
      collateralAddress,
      borrowAmount,
      config.slippageBps,
      config.dryRun
    );
    await supply(collateralAddress, amountReceived, config.dryRun);

    loopsPerformed++;
  }

  const finalAccountData = await getUserAccountData(userAddress);

  logger.success(`Added ${loopsPerformed} loops`);

  return {
    loopsPerformed,
    totalCollateral: finalAccountData.totalCollateralBase,
    totalDebt: finalAccountData.totalDebtBase,
    healthFactor: finalAccountData.healthFactor,
    spreadBps,
  };
}

/**
 * Deleverage position to reach target health factor
 *
 * @param targetHealthFactor Target health factor (e.g., 2.0)
 * @param config Strategy configuration
 */
export async function delever(
  targetHealthFactor: number,
  config: StrategyConfig
): Promise<void> {
  logger.info('=== DELEVERAGING POSITION ===');
  logger.info(`Target HF: ${targetHealthFactor.toFixed(2)}`);

  const userAddress = await getSignerAddress();
  const collateralAddress = getTokenAddress(config.collateralAsset);
  const debtAddress = getTokenAddress(config.debtAsset);

  // Get token decimals
  const [collateralDecimals, debtDecimals] = await Promise.all([
    getTokenDecimals(collateralAddress),
    getTokenDecimals(debtAddress),
  ]);

  // Get current position
  const accountData = await getUserAccountData(userAddress);

  logger.info(`Current HF: ${formatHealthFactor(accountData.healthFactor)}`);
  logger.info(`Current debt: $${formatAmount(accountData.totalDebtBase, 8, 2)}`);

  const targetHFBigInt = BigInt(Math.floor(targetHealthFactor * 1e18));

  if (accountData.healthFactor >= targetHFBigInt) {
    logger.info('Already at or above target health factor');
    return;
  }

  // Calculate repay amount needed
  const repayAmountBase = calculateRepayAmountForHF(
    accountData.totalCollateralBase,
    accountData.totalDebtBase,
    accountData.currentLiquidationThreshold,
    targetHFBigInt
  );

  logger.info(`Need to repay: $${formatAmount(repayAmountBase, 8, 2)}`);

  // Convert to token amount
  const repayAmount = repayAmountBase * 10n ** BigInt(collateralDecimals) / 10n ** 8n;

  // Withdraw collateral to get funds for repayment
  logger.info(`Withdrawing ${formatAmount(repayAmount, collateralDecimals, 2)} ${config.collateralAsset}`);
  await withdraw(collateralAddress, repayAmount, config.dryRun);

  // Swap collateral to debt token
  logger.info(`Swapping ${config.collateralAsset} -> ${config.debtAsset}`);
  const debtTokenReceived = await swapWithSlippage(
    collateralAddress,
    debtAddress,
    repayAmount,
    config.slippageBps,
    config.dryRun
  );

  // Repay debt
  logger.info(`Repaying ${formatAmount(debtTokenReceived, debtDecimals, 2)} ${config.debtAsset}`);
  await repay(debtAddress, debtTokenReceived, InterestRateMode.Variable, config.dryRun);

  // Final status
  const finalAccountData = await getUserAccountData(userAddress);
  logger.success(`\nDeleveraging complete`);
  logger.info(`New HF: ${formatHealthFactor(finalAccountData.healthFactor)}`);
  logger.info(`New debt: $${formatAmount(finalAccountData.totalDebtBase, 8, 2)}`);
}

/**
 * Print current position status
 *
 * @param config Strategy configuration
 */
export async function printStatus(config: StrategyConfig): Promise<void> {
  const userAddress = await getSignerAddress();
  const collateralAddress = getTokenAddress(config.collateralAsset);
  const debtAddress = getTokenAddress(config.debtAsset);

  // Get account data
  await printAccountStatus(userAddress);

  // Get APYs
  const [collateralAPYs, debtAPYs] = await Promise.all([
    getAssetAPYs(collateralAddress),
    getAssetAPYs(debtAddress),
  ]);

  const spreadBps = calculateSpreadBps(collateralAPYs.supplyAPY, debtAPYs.variableBorrowAPY);

  console.log('=== APY INFORMATION ===');
  console.log(`${config.collateralAsset} Supply APY: ${collateralAPYs.supplyAPY.toFixed(2)}%`);
  console.log(`${config.debtAsset} Borrow APY (Variable): ${debtAPYs.variableBorrowAPY.toFixed(2)}%`);
  console.log(`Spread: ${formatBps(spreadBps)}`);
  console.log(`Profitable: ${spreadBps >= config.minSpreadBps ? 'YES' : 'NO'}`);
  console.log('======================\n');
}
