/**
 * Network configuration with official Aave v3 and DEX addresses
 *
 * Aave v3 Ethereum addresses from: https://docs.aave.com/developers/deployed-contracts/v3-mainnet
 */

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl?: string; // Loaded from env
  aave: {
    poolAddressesProvider: string;
    pool: string; // Can be resolved dynamically, but hardcoded for speed
    poolDataProvider: string;
  };
  tokens: {
    [symbol: string]: string; // Token address by symbol
  };
  dex: {
    uniswapV3Router: string;
    uniswapV3Quoter: string;
  };
}

export const networks: Record<string, NetworkConfig> = {
  mainnet: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    aave: {
      poolAddressesProvider: '0x2f39d218133AFaB8F2B1583715A24AbE35eC48e8',
      pool: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
      poolDataProvider: '0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3',
    },
    tokens: {
      USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    },
    dex: {
      uniswapV3Router: '0xE592427A0AEce92De3Edee1F18E0157C05861564', // SwapRouter
      uniswapV3Quoter: '0xb27308f9F90D0b1d493682b6E7A9A3D8d5E33ac0', // QuoterV2
    },
  },
  // Otras redes se pueden añadir aquí (Polygon, Arbitrum, Optimism, etc.)
};

/**
 * Get network config by chain ID or name
 */
export function getNetworkConfig(networkNameOrChainId: string | number): NetworkConfig {
  if (typeof networkNameOrChainId === 'number') {
    const network = Object.values(networks).find(n => n.chainId === networkNameOrChainId);
    if (!network) {
      throw new Error(`Network with chainId ${networkNameOrChainId} not found`);
    }
    return network;
  }

  const network = networks[networkNameOrChainId];
  if (!network) {
    throw new Error(`Network ${networkNameOrChainId} not found`);
  }
  return network;
}
