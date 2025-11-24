/**
 * Simple logger utility with consistent formatting
 */

export enum LogLevel {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

/**
 * Format and log a message with timestamp and level
 */
function log(level: LogLevel, message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;

  switch (level) {
    case LogLevel.ERROR:
      console.error(`${prefix} ${message}`, data ? data : '');
      break;
    case LogLevel.WARNING:
      console.warn(`${prefix} ${message}`, data ? data : '');
      break;
    case LogLevel.DEBUG:
      if (process.env.DEBUG === 'true') {
        console.debug(`${prefix} ${message}`, data ? data : '');
      }
      break;
    default:
      console.log(`${prefix} ${message}`, data ? data : '');
  }
}

export const logger = {
  info: (message: string, data?: any) => log(LogLevel.INFO, message, data),
  success: (message: string, data?: any) => log(LogLevel.SUCCESS, message, data),
  warn: (message: string, data?: any) => log(LogLevel.WARNING, message, data),
  error: (message: string, data?: any) => log(LogLevel.ERROR, message, data),
  debug: (message: string, data?: any) => log(LogLevel.DEBUG, message, data),
};

/**
 * Format bigint amounts with decimals for display
 */
export function formatAmount(amount: bigint, decimals: number, maxDecimals: number = 4): string {
  const divisor = 10n ** BigInt(decimals);
  const integerPart = amount / divisor;
  const fractionalPart = amount % divisor;

  if (fractionalPart === 0n) {
    return integerPart.toString();
  }

  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const truncated = fractionalStr.slice(0, maxDecimals);

  return `${integerPart}.${truncated}`;
}

/**
 * Format health factor for display (HF has 18 decimals)
 */
export function formatHealthFactor(hf: bigint): string {
  if (hf === ethers.MaxUint256) {
    return '∞';
  }
  return formatAmount(hf, 18, 2);
}

/**
 * Format percentage (value in bps to %)
 */
export function formatBps(bps: number): string {
  return (bps / 100).toFixed(2) + '%';
}

/**
 * Format APY from ray units (27 decimals) to percentage
 */
export function formatAPY(rayRate: bigint): string {
  // APY = (1 + rate/seconds_per_year)^seconds_per_year - 1
  // Simplified: convert ray to percentage directly
  const SECONDS_PER_YEAR = 31536000n;
  const RAY = 10n ** 27n;

  // Calculate APY: rate * seconds_per_year / RAY
  const apy = (rayRate * SECONDS_PER_YEAR * 10000n) / RAY / 100n;
  return (Number(apy) / 100).toFixed(2) + '%';
}

// Export ethers for MaxUint256
import { ethers } from 'ethers';
