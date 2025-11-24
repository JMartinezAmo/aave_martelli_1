/**
 * Provider and signer initialization
 *
 * SECURITY: Never hardcode private keys or RPC URLs
 */

import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

let providerInstance: ethers.JsonRpcProvider | null = null;
let signerInstance: ethers.Wallet | null = null;

/**
 * Get or create provider instance (singleton pattern)
 */
export function getProvider(): ethers.JsonRpcProvider {
  if (!providerInstance) {
    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) {
      throw new Error('RPC_URL not set in environment variables');
    }
    providerInstance = new ethers.JsonRpcProvider(rpcUrl);
  }
  return providerInstance;
}

/**
 * Get or create signer instance (singleton pattern)
 */
export function getSigner(): ethers.Wallet {
  if (!signerInstance) {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY not set in environment variables');
    }

    // Validate private key format
    if (!privateKey.startsWith('0x') || privateKey.length !== 66) {
      throw new Error('PRIVATE_KEY must be in format 0x... with 64 hex chars');
    }

    const provider = getProvider();
    signerInstance = new ethers.Wallet(privateKey, provider);
  }
  return signerInstance;
}

/**
 * Get signer address
 */
export async function getSignerAddress(): Promise<string> {
  const signer = getSigner();
  return await signer.getAddress();
}

/**
 * Get current network info
 */
export async function getNetworkInfo(): Promise<{ chainId: number; name: string }> {
  const provider = getProvider();
  const network = await provider.getNetwork();
  return {
    chainId: Number(network.chainId),
    name: network.name,
  };
}

/**
 * Get current gas price
 */
export async function getGasPrice(): Promise<bigint> {
  const provider = getProvider();
  const feeData = await provider.getFeeData();
  return feeData.gasPrice || 0n;
}

/**
 * Reset provider and signer (useful for testing)
 */
export function resetProvider(): void {
  providerInstance = null;
  signerInstance = null;
}
