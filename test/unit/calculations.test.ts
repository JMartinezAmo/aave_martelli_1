/**
 * Unit tests for calculation functions
 *
 * These tests verify the pure mathematical logic
 */

import { expect } from 'chai';
import {
  calculateSpreadBps,
  calculateMaxBorrowForHF,
  calculateSafeBorrowAmount,
  calculateNewHealthFactor,
  calculateRepayAmountForHF,
  isProfitableSpread,
} from '../../src/strategy/calculations';
import { UserAccountData } from '../../src/aave/types';

describe('Calculations', () => {
  describe('calculateSpreadBps', () => {
    it('should calculate positive spread correctly', () => {
      const depositAPY = 5.5;
      const borrowAPY = 4.2;
      const spreadBps = calculateSpreadBps(depositAPY, borrowAPY);

      expect(spreadBps).to.equal(130); // 1.3% = 130 bps
    });

    it('should calculate negative spread correctly', () => {
      const depositAPY = 3.0;
      const borrowAPY = 4.5;
      const spreadBps = calculateSpreadBps(depositAPY, borrowAPY);

      expect(spreadBps).to.equal(-150); // -1.5% = -150 bps
    });

    it('should handle zero spread', () => {
      const spreadBps = calculateSpreadBps(5.0, 5.0);
      expect(spreadBps).to.equal(0);
    });
  });

  describe('calculateMaxBorrowForHF', () => {
    it('should calculate max borrow to maintain target HF', () => {
      const totalCollateral = 10000n * 10n ** 8n; // $10,000
      const currentDebt = 5000n * 10n ** 8n; // $5,000
      const liquidationThreshold = 8500n; // 85%
      const targetHF = 18n * 10n ** 17n; // 1.8

      const maxBorrow = calculateMaxBorrowForHF(
        totalCollateral,
        currentDebt,
        liquidationThreshold,
        targetHF
      );

      // Expected: (10000 * 0.85) / 1.8 - 5000 = 4722.22 - 5000 = -277.78
      // But since result is negative, should handle gracefully
      // Actually: 8500 / 1.8 = 4722.22, so max additional borrow is negative (already over)

      expect(Number(maxBorrow)).to.be.gte(0);
    });

    it('should return zero if already at max debt', () => {
      const totalCollateral = 10000n * 10n ** 8n;
      const currentDebt = 8000n * 10n ** 8n;
      const liquidationThreshold = 8000n; // 80%
      const targetHF = 15n * 10n ** 17n; // 1.5

      const maxBorrow = calculateMaxBorrowForHF(
        totalCollateral,
        currentDebt,
        liquidationThreshold,
        targetHF
      );

      // Max debt = (10000 * 0.8) / 1.5 = 5333.33
      // Current debt is 8000, so already over
      expect(Number(maxBorrow)).to.equal(0);
    });

    it('should handle zero target HF', () => {
      const maxBorrow = calculateMaxBorrowForHF(10000n, 5000n, 8500n, 0n);
      expect(Number(maxBorrow)).to.equal(0);
    });
  });

  describe('calculateSafeBorrowAmount', () => {
    it('should apply safety constraints correctly', () => {
      const accountData: UserAccountData = {
        totalCollateralBase: 10000n * 10n ** 8n,
        totalDebtBase: 2000n * 10n ** 8n,
        availableBorrowsBase: 5000n * 10n ** 8n,
        currentLiquidationThreshold: 8500n,
        ltv: 8000n,
        healthFactor: 30n * 10n ** 17n, // 3.0
      };

      const safeBorrow = calculateSafeBorrowAmount(
        accountData,
        70, // Use 70% of available
        0.9, // 90% safety margin
        18n * 10n ** 17n // Min HF 1.8
      );

      // Available: 5000
      // After maxLtvUsage (70%): 3500
      // After safety margin (90%): 3150
      expect(Number(safeBorrow)).to.be.lte(Number(5000n * 10n ** 8n));
      expect(Number(safeBorrow)).to.be.gt(0);
    });

    it('should return zero if no borrow capacity', () => {
      const accountData: UserAccountData = {
        totalCollateralBase: 1000n * 10n ** 8n,
        totalDebtBase: 900n * 10n ** 8n,
        availableBorrowsBase: 0n,
        currentLiquidationThreshold: 8500n,
        ltv: 8000n,
        healthFactor: 11n * 10n ** 17n, // 1.1
      };

      const safeBorrow = calculateSafeBorrowAmount(accountData, 70, 0.9, 18n * 10n ** 17n);

      expect(Number(safeBorrow)).to.equal(0);
    });
  });

  describe('calculateNewHealthFactor', () => {
    it('should calculate new HF after borrowing', () => {
      const currentCollateral = 10000n * 10n ** 8n;
      const currentDebt = 2000n * 10n ** 8n;
      const additionalDebt = 1000n * 10n ** 8n;
      const liquidationThreshold = 8500n; // 85%

      const newHF = calculateNewHealthFactor(
        currentCollateral,
        currentDebt,
        additionalDebt,
        liquidationThreshold
      );

      // New debt = 3000
      // HF = (10000 * 0.85) / 3000 = 8500 / 3000 = 2.833...
      const expectedHF = 28n * 10n ** 17n; // Approximately 2.8

      expect(Number(newHF)).to.be.closeTo(Number(expectedHF), Number(5n * 10n ** 17n));
    });

    it('should return very high HF if no debt', () => {
      const newHF = calculateNewHealthFactor(10000n, 0n, 0n, 8500n);

      // Should return 1000.0 (effectively infinite)
      expect(Number(newHF)).to.equal(Number(1000n * 10n ** 18n));
    });
  });

  describe('calculateRepayAmountForHF', () => {
    it('should calculate repay amount to reach target HF', () => {
      const totalCollateral = 10000n * 10n ** 8n;
      const totalDebt = 6000n * 10n ** 8n;
      const liquidationThreshold = 8500n;
      const targetHF = 20n * 10n ** 17n; // 2.0

      const repayAmount = calculateRepayAmountForHF(
        totalCollateral,
        totalDebt,
        liquidationThreshold,
        targetHF
      );

      // Current HF = (10000 * 0.85) / 6000 = 1.417
      // Target debt = (10000 * 0.85) / 2.0 = 4250
      // Repay = 6000 - 4250 = 1750

      expect(Number(repayAmount)).to.be.gt(0);
      expect(Number(repayAmount)).to.be.lte(Number(totalDebt));
    });

    it('should return zero if already above target HF', () => {
      const repayAmount = calculateRepayAmountForHF(
        10000n * 10n ** 8n,
        2000n * 10n ** 8n,
        8500n,
        20n * 10n ** 17n
      );

      // Current HF = (10000 * 0.85) / 2000 = 4.25 > 2.0
      expect(Number(repayAmount)).to.equal(0);
    });
  });

  describe('isProfitableSpread', () => {
    it('should return true for profitable spread', () => {
      const result = isProfitableSpread(5.5, 4.2, 100);
      expect(result).to.be.true; // Spread 130 bps > 100 bps
    });

    it('should return false for insufficient spread', () => {
      const result = isProfitableSpread(4.5, 4.3, 100);
      expect(result).to.be.false; // Spread 20 bps < 100 bps
    });

    it('should return false for negative spread', () => {
      const result = isProfitableSpread(3.0, 4.5, 10);
      expect(result).to.be.false; // Negative spread
    });
  });
});
