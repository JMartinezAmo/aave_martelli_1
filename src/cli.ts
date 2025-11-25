#!/usr/bin/env node

/**
 * CLI entry point for Aave Carry Trade Bot
 *
 * Commands:
 * - status: Show current position
 * - open <amount>: Open new looping position
 * - add: Add loops to existing position
 * - delever <targetHF>: Reduce leverage to target health factor
 */

import { ethers } from 'ethers';
import { loadStrategyConfig, StrategyConfig } from '../config/strategy';
import { openLoops, addLoops, delever, printStatus } from './strategy/loopingStrategy';
import { getTokenAddress, getTokenDecimals } from './infrastructure/contracts';
import { logger } from './utils/logger';

/**
 * Parse command line arguments
 */
function parseArgs(): { command: string; args: string[] } {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    return { command: 'help', args: [] };
  }

  const command = args[0];
  const commandArgs = args.slice(1);

  return { command, args: commandArgs };
}

/**
 * Print usage help
 */
function printHelp(): void {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║        Aave v3 Carry Trade Bot - Command Line Tool        ║
╚════════════════════════════════════════════════════════════╝

USAGE:
  npm run dev -- <command> [options]

COMMANDS:
  status
      Show current position status (collateral, debt, HF, APYs)

  open <amount>
      Open new looping position with initial collateral
      Example: npm run dev -- open 1000
      (amount in collateral token units, e.g., 1000 USDC)

  add
      Add more loops to existing position
      Example: npm run dev -- add

  delever <targetHF>
      Reduce leverage to reach target health factor
      Example: npm run dev -- delever 2.5

  help
      Show this help message

CONFIGURATION:
  Edit config/strategy.ts to adjust:
  - Collateral and debt assets
  - Max loops, min health factor, max LTV usage
  - Minimum spread, slippage tolerance
  - Dry run mode (simulate without transactions)

ENVIRONMENT:
  Required variables in .env:
  - RPC_URL: Ethereum RPC endpoint
  - PRIVATE_KEY: Wallet private key (0x...)
  - NETWORK: Network name (default: mainnet)

⚠️  WARNING:
  This is EXPERIMENTAL software for small capital only.
  Understand the risks: liquidation, rate changes, depegs, bugs.
  Always test on fork first!
`);
}

/**
 * Main CLI handler
 */
async function main(): Promise<void> {
  const { command, args } = parseArgs();

  try {
    // Load configuration
    const config = loadStrategyConfig();

    switch (command) {
      case 'status': {
        logger.info('Fetching position status...');
        await printStatus(config);
        break;
      }

      case 'open': {
        if (args.length === 0) {
          logger.error('Missing argument: amount');
          console.log('Usage: npm run dev -- open <amount>');
          console.log('Example: npm run dev -- open 1000');
          process.exit(1);
        }

        const amountStr = args[0];
        const amount = parseFloat(amountStr);

        if (isNaN(amount) || amount <= 0) {
          logger.error('Invalid amount. Must be a positive number.');
          process.exit(1);
        }

        // Get decimals for collateral token
        const collateralAddress = getTokenAddress(config.collateralAsset);
        const collateralDecimals = await getTokenDecimals(collateralAddress);

        // Convert to token units with correct decimals
        const amountBigInt = ethers.parseUnits(amountStr, collateralDecimals);

        logger.info(`Opening position with ${amount} ${config.collateralAsset}`);

        if (config.dryRun) {
          logger.warn('=== DRY RUN MODE - NO TRANSACTIONS WILL BE SENT ===');
        }

        const result = await openLoops(amountBigInt, config);

        logger.success('\n=== OPERATION COMPLETE ===');
        logger.info(`Loops performed: ${result.loopsPerformed}`);
        break;
      }

      case 'add': {
        logger.info('Adding loops to existing position...');

        if (config.dryRun) {
          logger.warn('=== DRY RUN MODE - NO TRANSACTIONS WILL BE SENT ===');
        }

        const result = await addLoops(config);

        logger.success('\n=== OPERATION COMPLETE ===');
        logger.info(`Loops added: ${result.loopsPerformed}`);
        break;
      }

      case 'delever': {
        if (args.length === 0) {
          logger.error('Missing argument: targetHF');
          console.log('Usage: npm run dev -- delever <targetHF>');
          console.log('Example: npm run dev -- delever 2.5');
          process.exit(1);
        }

        const targetHF = parseFloat(args[0]);

        if (isNaN(targetHF) || targetHF <= 1.0) {
          logger.error('Invalid target HF. Must be > 1.0');
          process.exit(1);
        }

        logger.info(`Deleveraging to HF ${targetHF.toFixed(2)}`);

        if (config.dryRun) {
          logger.warn('=== DRY RUN MODE - NO TRANSACTIONS WILL BE SENT ===');
        }

        await delever(targetHF, config);

        logger.success('\n=== OPERATION COMPLETE ===');
        break;
      }

      case 'help':
      default: {
        printHelp();
        break;
      }
    }
  } catch (error: any) {
    logger.error('Error executing command:');
    logger.error(error.message);

    if (process.env.DEBUG === 'true') {
      console.error(error);
    }

    process.exit(1);
  }
}

// Run CLI
main();
