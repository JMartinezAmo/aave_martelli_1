/**
 * Hardhat configuration for testing with mainnet fork
 */

import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import * as dotenv from 'dotenv';

dotenv.config();

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || process.env.RPC_URL || '';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000001';

// Forking configuration
const FORK_ENABLED = process.env.FORK === 'true';
const FORK_BLOCK_NUMBER = process.env.FORK_BLOCK_NUMBER
  ? parseInt(process.env.FORK_BLOCK_NUMBER)
  : undefined;

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    hardhat: {
      chainId: 1,
      forking: FORK_ENABLED
        ? {
            url: MAINNET_RPC_URL,
            blockNumber: FORK_BLOCK_NUMBER,
            enabled: true,
          }
        : undefined,
      accounts: [
        {
          privateKey: PRIVATE_KEY,
          balance: '10000000000000000000000', // 10000 ETH for gas
        },
      ],
    },
    mainnet: {
      url: MAINNET_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 1,
    },
  },

  mocha: {
    timeout: 300000, // 5 minutes for integration tests
  },

  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
};

export default config;
