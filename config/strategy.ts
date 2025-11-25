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
  const config = {
    ...defaultStrategyConfig,
    ...overrides,
  };

  // Validate configuration parameters
  validateStrategyConfig(config);

  return config;
}

/**
 * Validate strategy configuration parameters
 */
function validateStrategyConfig(config: StrategyConfig): void {
  // Validate numeric ranges
  if (config.maxLoops < 1 || config.maxLoops > 10) {
    throw new Error(`maxLoops must be between 1 and 10, got ${config.maxLoops}`);
  }

  if (config.minHealthFactor < 1.05) {
    throw new Error(`minHealthFactor must be >= 1.05 (liquidation threshold), got ${config.minHealthFactor}`);
  }

  if (config.maxLtvUsage < 0 || config.maxLtvUsage > 100) {
    throw new Error(`maxLtvUsage must be between 0 and 100, got ${config.maxLtvUsage}`);
  }

  if (config.minSpreadBps < 0) {
    throw new Error(`minSpreadBps must be >= 0, got ${config.minSpreadBps}`);
  }

  // Validate slippage is reasonable (< 10%)
  if (config.slippageBps < 0 || config.slippageBps > 1000) {
    throw new Error(`slippageBps must be between 0 and 1000 (10%), got ${config.slippageBps}. High slippage increases risk of losses.`);
  }

  if (config.borrowSafetyMargin < 0.5 || config.borrowSafetyMargin > 1.0) {
    throw new Error(`borrowSafetyMargin must be between 0.5 and 1.0, got ${config.borrowSafetyMargin}`);
  }

  // Validate assets are specified
  if (!config.collateralAsset || config.collateralAsset.length === 0) {
    throw new Error('collateralAsset must be specified');
  }

  if (!config.debtAsset || config.debtAsset.length === 0) {
    throw new Error('debtAsset must be specified');
  }

  // Warn if collateral and debt are the same
  if (config.collateralAsset === config.debtAsset) {
    throw new Error('collateralAsset and debtAsset must be different');
  }
}
