/**
 * Aave v3 service layer
 *
 * Provides high-level functions to interact with Aave Pool
 */

import { ethers } from 'ethers';
import { getPoolContract, getPoolDataProviderContract, ensureTokenApproval } from '../infrastructure/contracts';
import { getSignerAddress } from '../infrastructure/provider';
import { logger, formatAmount, formatHealthFactor, formatAPY } from '../utils/logger';
import {
  UserAccountData,
  ReserveData,
  ReserveConfigurationData,
  APYData,
  InterestRateMode,
} from './types';

const RAY = 10n ** 27n; // Aave uses ray units (27 decimals) for rates
const SECONDS_PER_YEAR = 31536000n;

/**
 * Get user account data from Aave Pool
 */
export async function getUserAccountData(userAddress: string): Promise<UserAccountData> {
  const pool = getPoolContract();

  const result = await pool.getUserAccountData(userAddress);

  return {
    totalCollateralBase: result[0],
    totalDebtBase: result[1],
    availableBorrowsBase: result[2],
    currentLiquidationThreshold: result[3],
    ltv: result[4],
    healthFactor: result[5],
  };
}

/**
 * Get reserve data for an asset
 */
export async function getReserveData(assetAddress: string): Promise<ReserveData> {
  const dataProvider = getPoolDataProviderContract();

  const result = await dataProvider.getReserveData(assetAddress);

  return {
    liquidityRate: result[5],
    variableBorrowRate: result[6],
    stableBorrowRate: result[7],
    liquidityIndex: result[9],
    variableBorrowIndex: result[10],
    lastUpdateTimestamp: Number(result[11]),
  };
}

/**
 * Get reserve configuration data for an asset
 */
export async function getReserveConfigurationData(
  assetAddress: string
): Promise<ReserveConfigurationData> {
  const dataProvider = getPoolDataProviderContract();

  const result = await dataProvider.getReserveConfigurationData(assetAddress);

  return {
    decimals: result[0],
    ltv: result[1],
    liquidationThreshold: result[2],
    liquidationBonus: result[3],
    reserveFactor: result[4],
    usageAsCollateralEnabled: result[5],
    borrowingEnabled: result[6],
    stableBorrowRateEnabled: result[7],
    isActive: result[8],
    isFrozen: result[9],
  };
}

/**
 * Calculate APY from rates (convert ray units to %)
 */
export function calculateAPY(rate: bigint): number {
  // APY = (1 + rate/SECONDS_PER_YEAR)^SECONDS_PER_YEAR - 1
  // Simplified approximation: rate * SECONDS_PER_YEAR / RAY
  const apy = (rate * SECONDS_PER_YEAR * 10000n) / RAY / 100n;
  return Number(apy) / 100;
}

/**
 * Get APYs for an asset
 */
export async function getAssetAPYs(assetAddress: string): Promise<APYData> {
  const reserveData = await getReserveData(assetAddress);

  return {
    supplyAPY: calculateAPY(reserveData.liquidityRate),
    variableBorrowAPY: calculateAPY(reserveData.variableBorrowRate),
    stableBorrowAPY: calculateAPY(reserveData.stableBorrowRate),
  };
}

/**
 * Supply (deposit) assets to Aave
 */
export async function supply(
  assetAddress: string,
  amount: bigint,
  dryRun: boolean = false
): Promise<void> {
  const userAddress = await getSignerAddress();
  const pool = getPoolContract();

  logger.info(`Supplying ${formatAmount(amount, 6, 2)} tokens to Aave`);

  if (dryRun) {
    logger.warn('DRY RUN: Transaction not sent');
    return;
  }

  // Ensure approval
  const approved = await ensureTokenApproval(assetAddress, await pool.getAddress(), amount);
  if (approved) {
    logger.info('Token approval granted');
  }

  // Supply to pool
  const tx = await pool.supply(assetAddress, amount, userAddress, 0);
  logger.info(`Supply tx sent: ${tx.hash}`);

  await tx.wait();
  logger.success('Supply completed');
}

/**
 * Withdraw assets from Aave
 */
export async function withdraw(
  assetAddress: string,
  amount: bigint,
  dryRun: boolean = false
): Promise<void> {
  const userAddress = await getSignerAddress();
  const pool = getPoolContract();

  logger.info(`Withdrawing ${formatAmount(amount, 6, 2)} tokens from Aave`);

  if (dryRun) {
    logger.warn('DRY RUN: Transaction not sent');
    return;
  }

  // Use max uint256 to withdraw all
  const withdrawAmount = amount === 0n ? ethers.MaxUint256 : amount;

  const tx = await pool.withdraw(assetAddress, withdrawAmount, userAddress);
  logger.info(`Withdraw tx sent: ${tx.hash}`);

  await tx.wait();
  logger.success('Withdraw completed');
}

/**
 * Borrow assets from Aave
 */
export async function borrow(
  assetAddress: string,
  amount: bigint,
  interestRateMode: InterestRateMode = InterestRateMode.Variable,
  dryRun: boolean = false
): Promise<void> {
  const userAddress = await getSignerAddress();
  const pool = getPoolContract();

  logger.info(`Borrowing ${formatAmount(amount, 6, 2)} tokens from Aave (mode: ${interestRateMode})`);

  if (dryRun) {
    logger.warn('DRY RUN: Transaction not sent');
    return;
  }

  const tx = await pool.borrow(assetAddress, amount, interestRateMode, 0, userAddress);
  logger.info(`Borrow tx sent: ${tx.hash}`);

  await tx.wait();
  logger.success('Borrow completed');
}

/**
 * Repay borrowed assets to Aave
 */
export async function repay(
  assetAddress: string,
  amount: bigint,
  interestRateMode: InterestRateMode = InterestRateMode.Variable,
  dryRun: boolean = false
): Promise<void> {
  const userAddress = await getSignerAddress();
  const pool = getPoolContract();

  logger.info(`Repaying ${formatAmount(amount, 6, 2)} tokens to Aave (mode: ${interestRateMode})`);

  if (dryRun) {
    logger.warn('DRY RUN: Transaction not sent');
    return;
  }

  // Ensure approval
  const approved = await ensureTokenApproval(assetAddress, await pool.getAddress(), amount);
  if (approved) {
    logger.info('Token approval granted');
  }

  // Use max uint256 to repay all
  const repayAmount = amount === 0n ? ethers.MaxUint256 : amount;

  const tx = await pool.repay(assetAddress, repayAmount, interestRateMode, userAddress);
  logger.info(`Repay tx sent: ${tx.hash}`);

  await tx.wait();
  logger.success('Repay completed');
}

/**
 * Print user account status in a readable format
 */
export async function printAccountStatus(userAddress: string): Promise<void> {
  const accountData = await getUserAccountData(userAddress);

  console.log('\n=== AAVE ACCOUNT STATUS ===');
  console.log(`User: ${userAddress}`);
  console.log(`Total Collateral: $${formatAmount(accountData.totalCollateralBase, 8, 2)}`);
  console.log(`Total Debt: $${formatAmount(accountData.totalDebtBase, 8, 2)}`);
  console.log(`Available to Borrow: $${formatAmount(accountData.availableBorrowsBase, 8, 2)}`);
  console.log(`Health Factor: ${formatHealthFactor(accountData.healthFactor)}`);
  console.log(`LTV: ${formatAmount(accountData.ltv, 2, 2)}%`);
  console.log(
    `Liquidation Threshold: ${formatAmount(accountData.currentLiquidationThreshold, 2, 2)}%`
  );
  console.log('===========================\n');
}
