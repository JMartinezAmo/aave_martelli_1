/**
 * DEX swap service (Uniswap v3)
 *
 * Handles token swaps with slippage protection
 */

import { ethers } from 'ethers';
import { getUniswapV3RouterContract, ensureTokenApproval } from '../infrastructure/contracts';
import { getSignerAddress } from '../infrastructure/provider';
import { logger, formatAmount } from '../utils/logger';

// Uniswap v3 fee tiers (in hundredths of a bps)
export enum FeeTier {
  LOWEST = 100, // 0.01%
  LOW = 500, // 0.05%
  MEDIUM = 3000, // 0.3%
  HIGH = 10000, // 1%
}

/**
 * Swap parameters
 */
export interface SwapParams {
  fromAsset: string; // Token address to swap from
  toAsset: string; // Token address to swap to
  amountIn: bigint; // Amount to swap
  minAmountOut: bigint; // Minimum amount to receive (slippage protection)
  feeTier?: FeeTier; // Uniswap v3 fee tier (default: MEDIUM)
  deadline?: number; // Deadline in seconds from now (default: 300 = 5 min)
}

/**
 * Calculate minimum amount out with slippage
 * @param amountIn Amount of input tokens
 * @param slippageBps Slippage tolerance in basis points (e.g., 50 = 0.5%)
 * @returns Minimum amount out considering slippage
 */
export function calculateMinAmountOut(amountIn: bigint, slippageBps: number): bigint {
  // minAmountOut = amountIn * (10000 - slippageBps) / 10000
  const slippageFactor = 10000n - BigInt(slippageBps);
  return (amountIn * slippageFactor) / 10000n;
}

/**
 * Execute a token swap on Uniswap v3
 *
 * IMPORTANT: For stablecoin swaps (USDC <-> USDT), we assume near 1:1 ratio
 * In production, you should use a quoter to get exact amounts
 */
export async function swapTokens(params: SwapParams, dryRun: boolean = false): Promise<bigint> {
  const {
    fromAsset,
    toAsset,
    amountIn,
    minAmountOut,
    feeTier = FeeTier.MEDIUM,
    deadline = 300,
  } = params;

  const router = getUniswapV3RouterContract();
  const routerAddress = await router.getAddress();

  logger.info(
    `Swapping ${formatAmount(amountIn, 6, 2)} tokens (fee tier: ${feeTier / 10000}%)`
  );

  if (dryRun) {
    logger.warn('DRY RUN: Swap not executed');
    // Return approximate amount for simulation (assume 1:1 for stablecoins)
    return amountIn;
  }

  // Ensure approval for router
  const approved = await ensureTokenApproval(fromAsset, routerAddress, amountIn);
  if (approved) {
    logger.info('Token approval granted to Uniswap router');
  }

  // Prepare swap parameters
  const deadlineTimestamp = Math.floor(Date.now() / 1000) + deadline;
  const recipientAddress = await getSignerAddress();

  const swapParams = {
    tokenIn: fromAsset,
    tokenOut: toAsset,
    fee: feeTier,
    recipient: recipientAddress,
    deadline: deadlineTimestamp,
    amountIn: amountIn,
    amountOutMinimum: minAmountOut,
    sqrtPriceLimitX96: 0, // No price limit
  };

  // Execute swap
  const tx = await router.exactInputSingle(swapParams);
  logger.info(`Swap tx sent: ${tx.hash}`);

  const receipt = await tx.wait();
  logger.success('Swap completed');

  // Parse the swap event to get actual amount out
  // Look for Transfer event to recipient on toAsset to get actual amount
  if (receipt && receipt.logs) {
    const transferTopic = ethers.id('Transfer(address,address,uint256)');

    for (const log of receipt.logs) {
      if (log.topics[0] === transferTopic && log.address.toLowerCase() === toAsset.toLowerCase()) {
        // Check if recipient matches (topic[2] is the 'to' address)
        const logRecipient = ethers.getAddress('0x' + log.topics[2].slice(26));
        if (logRecipient.toLowerCase() === recipientAddress.toLowerCase()) {
          const amountOut = BigInt(log.data);
          logger.debug(`Actual amount received from swap: ${formatAmount(amountOut, 6, 2)}`);
          return amountOut;
        }
      }
    }
  }

  // Fallback: return minAmountOut if we couldn't parse the event
  logger.warn('Could not parse swap event, returning minAmountOut');
  return minAmountOut;
}

/**
 * Swap with automatic slippage calculation
 */
export async function swapWithSlippage(
  fromAsset: string,
  toAsset: string,
  amountIn: bigint,
  slippageBps: number,
  dryRun: boolean = false
): Promise<bigint> {
  // For stablecoins, assume 1:1 ratio and apply slippage
  // In production, use Uniswap Quoter to get exact quote
  const minAmountOut = calculateMinAmountOut(amountIn, slippageBps);

  return await swapTokens(
    {
      fromAsset,
      toAsset,
      amountIn,
      minAmountOut,
    },
    dryRun
  );
}

/**
 * Get estimated amount out for a swap (simplified for stablecoins)
 *
 * NOTE: In production, use Uniswap Quoter contract for accurate quotes
 * This is a simplified version assuming 1:1 for stablecoins
 */
export function estimateAmountOut(
  amountIn: bigint,
  fromDecimals: number,
  toDecimals: number
): bigint {
  // Adjust for decimals difference
  if (fromDecimals === toDecimals) {
    return amountIn;
  }

  if (fromDecimals > toDecimals) {
    const diff = fromDecimals - toDecimals;
    return amountIn / 10n ** BigInt(diff);
  } else {
    const diff = toDecimals - fromDecimals;
    return amountIn * 10n ** BigInt(diff);
  }
}
