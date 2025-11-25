/**
 * Pure calculation functions for looping strategy
 *
 * These functions are blockchain-independent and can be unit tested easily
 */

import { UserAccountData } from '../aave/types';

/**
 * Calculate spread between deposit and borrow APY in basis points
 * @param depositAPY Deposit APY as percentage (e.g., 5.5)
 * @param borrowAPY Borrow APY as percentage (e.g., 4.2)
 * @returns Spread in basis points (e.g., 130 = 1.3%)
 */
export function calculateSpreadBps(depositAPY: number, borrowAPY: number): number {
  const spreadPercent = depositAPY - borrowAPY;
  return Math.round(spreadPercent * 100);
}

/**
 * Calculate maximum borrow amount to maintain a target health factor
 *
 * Formula:
 * HF = (totalCollateral * liquidationThreshold) / totalDebt
 * Solving for maxDebt:
 * maxDebt = (totalCollateral * liquidationThreshold) / targetHF
 *
 * @param totalCollateralBase Current total collateral in base currency
 * @param currentDebtBase Current total debt in base currency
 * @param liquidationThreshold Liquidation threshold in bps (e.g., 8500 = 85%)
 * @param targetHealthFactor Target health factor (e.g., 1.8 with 18 decimals)
 * @returns Maximum additional borrow amount in base currency
 */
export function calculateMaxBorrowForHF(
  totalCollateralBase: bigint,
  currentDebtBase: bigint,
  liquidationThreshold: bigint,
  targetHealthFactor: bigint
): bigint {
  // Avoid division by zero
  if (targetHealthFactor === 0n) {
    return 0n;
  }

  // Calculate max total debt that maintains target HF
  // maxTotalDebt = (totalCollateral * liquidationThreshold / 10000) / (targetHF / 1e18)
  // Simplifying: maxTotalDebt = (totalCollateral * liquidationThreshold * 1e18) / (10000 * targetHF)

  const maxTotalDebt =
    (totalCollateralBase * liquidationThreshold * 10n ** 18n) / (10000n * targetHealthFactor);

  // Additional borrow capacity
  if (maxTotalDebt <= currentDebtBase) {
    return 0n; // Already at or above target HF
  }

  return maxTotalDebt - currentDebtBase;
}

/**
 * Calculate safe borrow amount considering multiple constraints
 *
 * @param accountData Current user account data
 * @param maxLtvUsagePercent Max % of available borrows to use (0-100)
 * @param safetyMargin Safety factor (0-1, e.g., 0.9 = use 90% of calculated max)
 * @param minHealthFactor Minimum target health factor (18 decimals)
 * @returns Safe borrow amount in base currency
 */
export function calculateSafeBorrowAmount(
  accountData: UserAccountData,
  maxLtvUsagePercent: number,
  safetyMargin: number,
  minHealthFactor: bigint
): bigint {
  // Constraint 1: Available borrows from Aave
  const availableByLtv = accountData.availableBorrowsBase;

  // Constraint 2: Amount that maintains min health factor
  const availableByHF = calculateMaxBorrowForHF(
    accountData.totalCollateralBase,
    accountData.totalDebtBase,
    accountData.currentLiquidationThreshold,
    minHealthFactor
  );

  // Take the minimum of both constraints
  let safeBorrow = availableByLtv < availableByHF ? availableByLtv : availableByHF;

  // Apply max LTV usage percentage
  safeBorrow = (safeBorrow * BigInt(maxLtvUsagePercent)) / 100n;

  // Apply safety margin
  const safetyMarginBigInt = BigInt(Math.floor(safetyMargin * 10000));
  safeBorrow = (safeBorrow * safetyMarginBigInt) / 10000n;

  return safeBorrow;
}

/**
 * Calculate new health factor after borrowing
 *
 * @param currentCollateral Current total collateral
 * @param currentDebt Current total debt
 * @param additionalDebt Additional debt to take
 * @param liquidationThreshold Liquidation threshold in bps
 * @returns New health factor (18 decimals)
 */
export function calculateNewHealthFactor(
  currentCollateral: bigint,
  currentDebt: bigint,
  additionalDebt: bigint,
  liquidationThreshold: bigint
): bigint {
  const newDebt = currentDebt + additionalDebt;

  if (newDebt === 0n) {
    // No debt = infinite health factor
    // Use a very high but reasonable value instead of MAX_UINT256 to avoid overflows
    return 1000n * 10n ** 18n; // 1000.0 - effectively infinite for practical purposes
  }

  // HF = (collateral * liquidationThreshold / 10000) / debt * 1e18
  const numerator = currentCollateral * liquidationThreshold * 10n ** 18n;
  const denominator = newDebt * 10000n;

  return numerator / denominator;
}

/**
 * Calculate amount to repay to reach target health factor
 *
 * @param totalCollateral Total collateral in base currency
 * @param totalDebt Total debt in base currency
 * @param liquidationThreshold Liquidation threshold in bps
 * @param targetHealthFactor Target health factor (18 decimals)
 * @returns Amount to repay in base currency
 */
export function calculateRepayAmountForHF(
  totalCollateral: bigint,
  totalDebt: bigint,
  liquidationThreshold: bigint,
  targetHealthFactor: bigint
): bigint {
  if (totalDebt === 0n || targetHealthFactor === 0n) {
    return 0n;
  }

  // Calculate target debt
  // targetDebt = (totalCollateral * liquidationThreshold * 1e18) / (10000 * targetHF)
  const targetDebt =
    (totalCollateral * liquidationThreshold * 10n ** 18n) / (10000n * targetHealthFactor);

  if (targetDebt >= totalDebt) {
    return 0n; // Already below or at target
  }

  return totalDebt - targetDebt;
}

/**
 * Check if it's profitable to open/add loops
 *
 * @param depositAPY Deposit APY as percentage
 * @param borrowAPY Borrow APY as percentage
 * @param minSpreadBps Minimum required spread in bps
 * @returns true if spread is sufficient
 */
export function isProfitableSpread(
  depositAPY: number,
  borrowAPY: number,
  minSpreadBps: number
): boolean {
  const spreadBps = calculateSpreadBps(depositAPY, borrowAPY);
  return spreadBps >= minSpreadBps;
}

/**
 * Estimate number of loops based on collateral increase
 *
 * This is an approximation based on the assumption that each loop
 * adds roughly the same amount of collateral
 *
 * @param initialCollateral Initial collateral amount
 * @param finalCollateral Final collateral amount
 * @returns Estimated number of loops performed
 */
export function estimateLoopsPerformed(
  initialCollateral: bigint,
  finalCollateral: bigint
): number {
  if (initialCollateral === 0n || finalCollateral <= initialCollateral) {
    return 0;
  }

  // Rough estimate: each loop multiplies collateral by ~1.7 (depends on LTV)
  // More accurate would require tracking each loop
  const ratio = Number(finalCollateral) / Number(initialCollateral);

  return Math.floor(Math.log(ratio) / Math.log(1.7));
}
