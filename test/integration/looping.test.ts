/**
 * Integration tests with Hardhat fork
 *
 * These tests run against a mainnet fork to test real contract interactions
 *
 * NOTE: These tests require a valid mainnet RPC URL
 * Set MAINNET_RPC_URL in your .env file
 */

import { expect } from 'chai';
import hre from 'hardhat';
import { ethers } from 'ethers';
import { loadStrategyConfig } from '../../config/strategy';
import { openLoops, printStatus } from '../../src/strategy/loopingStrategy';
import { getUserAccountData } from '../../src/aave/aaveService';
import { getTokenAddress, getTokenContract } from '../../src/infrastructure/contracts';
import { getSigner, getSignerAddress } from '../../src/infrastructure/provider';

describe('Looping Strategy Integration Tests', () => {
  const USDC_WHALE = '0x4B16c5dE96EB2117bBE5fd171E4d203624B014aa'; // Aave treasury
  const INITIAL_AMOUNT = ethers.parseUnits('1000', 6); // 1000 USDC

  // Helper to get signers from hardhat
  async function getHardhatSigner(address: string) {
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [address],
    });
    // @ts-ignore - hardhat ethers extension
    return await hre.ethers.provider.getSigner(address);
  }

  let userAddress: string;

  before(async () => {
    // Get test account address
    userAddress = await getSignerAddress();

    // Fund test account with USDC from whale
    const usdcAddress = getTokenAddress('USDC');

    // Impersonate whale and get signer
    const whaleSigner = await getHardhatSigner(USDC_WHALE);

    // Transfer USDC to test account
    const usdc = getTokenContract(usdcAddress, false).connect(whaleSigner) as any;
    const transferTx = await usdc.transfer(userAddress, INITIAL_AMOUNT);
    await transferTx.wait();

    await hre.network.provider.request({
      method: 'hardhat_stopImpersonatingAccount',
      params: [USDC_WHALE],
    });

    console.log(`Test account ${userAddress} funded with 1000 USDC`);
  });

  describe('openLoops', () => {
    it('should successfully open a looping position', async function () {
      // This test may take a while
      this.timeout(120000);

      const config = loadStrategyConfig({
        maxLoops: 2, // Limit loops for faster testing
        minHealthFactor: 1.8,
        maxLtvUsage: 60,
        dryRun: false,
      });

      // Check initial balance
      const usdcAddress = getTokenAddress('USDC');
      const usdc = getTokenContract(usdcAddress, false);
      const initialBalance = await usdc.balanceOf(userAddress);

      expect(Number(initialBalance)).to.be.gte(Number(INITIAL_AMOUNT));

      // Check initial account data (should be zero)
      const initialAccountData = await getUserAccountData(userAddress);
      expect(Number(initialAccountData.totalCollateralBase)).to.equal(0);
      expect(Number(initialAccountData.totalDebtBase)).to.equal(0);

      // Open loops with 500 USDC
      const depositAmount = ethers.parseUnits('500', 6);
      const result = await openLoops(depositAmount, config);

      console.log('Looping result:', result);

      // Verify results
      expect(result.loopsPerformed).to.be.gte(0);
      expect(result.loopsPerformed).to.be.lte(config.maxLoops);

      // If loops were performed, check position
      if (result.loopsPerformed > 0) {
        expect(Number(result.totalCollateral)).to.be.gt(0);
        expect(Number(result.totalDebt)).to.be.gt(0);
        expect(Number(result.healthFactor)).to.be.gte(Number(BigInt(Math.floor(config.minHealthFactor * 1e18))));

        // Verify collateral increased (due to looping)
        const finalAccountData = await getUserAccountData(userAddress);
        expect(Number(finalAccountData.totalCollateralBase)).to.be.gt(Number(depositAmount * 10n ** 2n)); // Adjusted for decimals
      }
    });

    it('should maintain health factor above minimum', async function () {
      this.timeout(60000);

      const accountData = await getUserAccountData(userAddress);

      // Health factor should be above 1.8 (with 18 decimals)
      const minHF = 18n * 10n ** 17n; // 1.8
      expect(Number(accountData.healthFactor)).to.be.gte(Number(minHF));

      console.log(`Health Factor: ${Number(accountData.healthFactor) / 1e18}`);
    });

    it('should have collateral greater than debt', async function () {
      this.timeout(60000);

      const accountData = await getUserAccountData(userAddress);

      // In a healthy position, collateral should always be > debt
      expect(Number(accountData.totalCollateralBase)).to.be.gt(Number(accountData.totalDebtBase));
    });
  });

  describe('printStatus', () => {
    it('should print position status without errors', async function () {
      this.timeout(60000);

      const config = loadStrategyConfig();

      // Should not throw - using try/catch for async function testing
      let error: any = null;
      try {
        await printStatus(config);
      } catch (e) {
        error = e;
      }

      expect(error).to.be.null;
    });
  });

  // NOTE: Tests for addLoops and delever would go here
  // Skipping for brevity, but follow same pattern as openLoops
});
