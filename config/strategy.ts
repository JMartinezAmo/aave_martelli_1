/**
 * Strategy configuration parameters
 *
 * CRITICAL: These parameters control risk. Adjust carefully.
 */

export interface StrategyConfig {
  // Network to use
  network: string; // e.g., 'mainnet'

  // Asset selection
  collateralAsset: string; // Token symbol (e.g., 'USDC')
  debtAsset: string; // Token symbol (e.g., 'USDT')

  // Looping parameters
  maxLoops: number; // Maximum number of loops per operation
  minHealthFactor: number; // Minimum target health factor (e.g., 1.8)
  maxLtvUsage: number; // Max % of availableBorrows to use (0-100, e.g., 70 = 70%)

  // Economic parameters
  minSpreadBps: number; // Minimum spread (deposit APY - borrow APY) in bps to open/add loops

  // Swap parameters
  slippageBps: number; // Max slippage for DEX swaps in bps (e.g., 50 = 0.5%)

  // Safety margins
  borrowSafetyMargin: number; // Safety factor when borrowing (0-1, e.g., 0.9 = use 90% of calculated max)

  // Execution mode
  dryRun: boolean; // If true, simulate without sending transactions
}

/**
 * Default configuration - CONSERVATIVE settings for experimentation
 */
export const defaultStrategyConfig: StrategyConfig = {
  network: 'mainnet',

  collateralAsset: 'USDC',
  debtAsset: 'USDT',

  maxLoops: 3,
  minHealthFactor: 1.8, // Conservative: far from liquidation (1.0)
  maxLtvUsage: 70, // Use max 70% of available borrows

  minSpreadBps: 10, // Require at least 0.1% positive spread

  slippageBps: 50, // 0.5% max slippage on swaps

  borrowSafetyMargin: 0.90, // Use only 90% of calculated max borrow amount

  dryRun: false,
};

/**
 * Load strategy config with overrides from environment or parameters
 */
export function loadStrategyConfig(overrides?: Partial<StrategyConfig>): StrategyConfig {
  return {
    ...defaultStrategyConfig,
    ...overrides,
  };
}
