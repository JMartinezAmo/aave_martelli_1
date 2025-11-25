/**
 * Contract instances and helpers
 *
 * Provides easy access to Aave Pool, tokens, and DEX contracts
 */

import { ethers, Contract } from 'ethers';
import { getSigner, getProvider } from './provider';
import { getNetworkConfig } from '../../config/networks';

// Import ABIs
import PoolABI from '../../abis/Pool.json';
import PoolDataProviderABI from '../../abis/PoolDataProvider.json';
import ERC20ABI from '../../abis/ERC20.json';
import UniswapV3RouterABI from '../../abis/UniswapV3Router.json';

// Cached contract instances
let poolContract: Contract | null = null;
let poolDataProviderContract: Contract | null = null;
const tokenContracts: Map<string, Contract> = new Map();

/**
 * Get Aave Pool contract instance
 */
export function getPoolContract(): Contract {
  if (!poolContract) {
    const signer = getSigner();
    const networkName = process.env.NETWORK || 'mainnet';
    const config = getNetworkConfig(networkName);

    poolContract = new Contract(config.aave.pool, PoolABI, signer);
  }
  return poolContract;
}

/**
 * Get Aave PoolDataProvider contract instance
 */
export function getPoolDataProviderContract(): Contract {
  if (!poolDataProviderContract) {
    const provider = getProvider();
    const networkName = process.env.NETWORK || 'mainnet';
    const config = getNetworkConfig(networkName);

    poolDataProviderContract = new Contract(
      config.aave.poolDataProvider,
      PoolDataProviderABI,
      provider
    );
  }
  return poolDataProviderContract;
}

/**
 * Get ERC20 token contract instance
 */
export function getTokenContract(tokenAddress: string, withSigner: boolean = true): Contract {
  const key = `${tokenAddress}_${withSigner}`;

  if (!tokenContracts.has(key)) {
    const signerOrProvider = withSigner ? getSigner() : getProvider();
    const contract = new Contract(tokenAddress, ERC20ABI, signerOrProvider);
    tokenContracts.set(key, contract);
  }

  return tokenContracts.get(key)!;
}

/**
 * Get token address by symbol from config
 */
export function getTokenAddress(symbol: string): string {
  const networkName = process.env.NETWORK || 'mainnet';
  const config = getNetworkConfig(networkName);

  const address = config.tokens[symbol];
  if (!address) {
    throw new Error(`Token ${symbol} not found in network ${networkName} config`);
  }

  return address;
}

/**
 * Get Uniswap V3 Router contract instance
 */
export function getUniswapV3RouterContract(): Contract {
  const signer = getSigner();
  const networkName = process.env.NETWORK || 'mainnet';
  const config = getNetworkConfig(networkName);

  return new Contract(config.dex.uniswapV3Router, UniswapV3RouterABI, signer);
}

/**
 * Get token info (symbol, decimals, name)
 */
export async function getTokenInfo(
  tokenAddress: string
): Promise<{ symbol: string; decimals: number; name: string }> {
  const contract = getTokenContract(tokenAddress, false);

  const [symbol, decimals, name] = await Promise.all([
    contract.symbol(),
    contract.decimals(),
    contract.name(),
  ]);

  return {
    symbol,
    decimals: Number(decimals),
    name,
  };
}

/**
 * Get token decimals
 */
export async function getTokenDecimals(tokenAddress: string): Promise<number> {
  const contract = getTokenContract(tokenAddress, false);
  const decimals = await contract.decimals();
  return Number(decimals);
}

/**
 * Get token balance for an address
 */
export async function getTokenBalance(tokenAddress: string, userAddress: string): Promise<bigint> {
  const contract = getTokenContract(tokenAddress, false);
  return await contract.balanceOf(userAddress);
}

/**
 * Check and approve token if needed
 * @returns true if approval was needed and executed, false if already approved
 */
export async function ensureTokenApproval(
  tokenAddress: string,
  spenderAddress: string,
  amount: bigint
): Promise<boolean> {
  const signer = getSigner();
  const userAddress = await signer.getAddress();
  const contract = getTokenContract(tokenAddress, true);

  // Check current allowance
  const currentAllowance: bigint = await contract.allowance(userAddress, spenderAddress);

  if (currentAllowance >= amount) {
    return false; // Already approved
  }

  // Approve max uint256 for efficiency (one-time approval)
  const maxUint256 = ethers.MaxUint256;
  const tx = await contract.approve(spenderAddress, maxUint256);
  await tx.wait();

  return true;
}

/**
 * Reset cached contracts (useful for testing)
 */
export function resetContracts(): void {
  poolContract = null;
  poolDataProviderContract = null;
  tokenContracts.clear();
}
