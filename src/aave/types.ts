/**
 * Type definitions for Aave data structures
 */

/**
 * User account data from Aave Pool
 */
export interface UserAccountData {
  totalCollateralBase: bigint; // Total collateral in base currency (USD with 8 decimals)
  totalDebtBase: bigint; // Total debt in base currency
  availableBorrowsBase: bigint; // Available to borrow in base currency
  currentLiquidationThreshold: bigint; // Liquidation threshold (in bps, e.g., 8500 = 85%)
  ltv: bigint; // Loan-to-value (in bps)
  healthFactor: bigint; // Health factor (18 decimals, < 1e18 = liquidatable)
}

/**
 * Reserve data for an asset
 */
export interface ReserveData {
  liquidityRate: bigint; // Current supply/liquidity rate (ray units: 27 decimals)
  variableBorrowRate: bigint; // Current variable borrow rate (ray units)
  stableBorrowRate: bigint; // Current stable borrow rate (ray units)
  liquidityIndex: bigint; // Liquidity index
  variableBorrowIndex: bigint; // Variable borrow index
  lastUpdateTimestamp: number; // Last update timestamp
}

/**
 * Reserve configuration data
 */
export interface ReserveConfigurationData {
  decimals: bigint;
  ltv: bigint; // Loan-to-value in bps
  liquidationThreshold: bigint; // Liquidation threshold in bps
  liquidationBonus: bigint; // Liquidation bonus in bps
  reserveFactor: bigint; // Reserve factor in bps
  usageAsCollateralEnabled: boolean;
  borrowingEnabled: boolean;
  stableBorrowRateEnabled: boolean;
  isActive: boolean;
  isFrozen: boolean;
}

/**
 * User reserve data for a specific asset
 */
export interface UserReserveData {
  currentATokenBalance: bigint; // Current aToken balance
  currentStableDebt: bigint; // Current stable debt
  currentVariableDebt: bigint; // Current variable debt
  principalStableDebt: bigint; // Principal stable debt
  scaledVariableDebt: bigint; // Scaled variable debt
  stableBorrowRate: bigint; // User's stable borrow rate
  liquidityRate: bigint; // User's liquidity rate
  stableRateLastUpdated: number; // Timestamp of last stable rate update
  usageAsCollateralEnabled: boolean; // Is used as collateral
}

/**
 * Interest rate mode for borrowing
 */
export enum InterestRateMode {
  None = 0,
  Stable = 1,
  Variable = 2,
}

/**
 * APY data in human-readable format
 */
export interface APYData {
  supplyAPY: number; // Supply APY as percentage (e.g., 5.5 = 5.5%)
  variableBorrowAPY: number; // Variable borrow APY as percentage
  stableBorrowAPY: number; // Stable borrow APY as percentage
}
