"use client";
import React from "react";
import { motion } from "framer-motion";
import UserBalance from "./UserBalance";
import StakingForm from "./StakingForm";
import UserStakes from "./UserStakes";
import RewardsSection from "./RewardsSection";

type NetworkType = "testnet" | "mainnet";

type StakingInterfaceProps = {
  account: string | null;
  wrongNetwork: boolean;
  selectedNetwork: NetworkType;
  tokenBalance: string;
  stakedBalance: string;
  pendingRewards: string;
  stakeAmount: string;
  onStakeAmountChange: (amount: string) => void;
  selectedDays: number;
  onSelectedDaysChange: (days: number) => void;
  userStakes: Array<{
    index: number;
    amount: string;
    weightedAmount: string;
    multiplier: number;
    lockEndBlock: number;
    isUnlocked: boolean;
    blocksRemaining: number;
  }>;
  isLoading: boolean;
  onStake: () => void;
  onWithdraw: (stakeIndex: number) => void;
  onClaimRewards: () => void;
  txHash: string;
  totalRewardsFunded: string;
  totalStakeWeight: string;
  topStakers: Array<{ address: string; weight: string; rawAmount?: string }>;
  stakingRanges: Array<{ range: string; count: number; totalWeight: string }>;
  onBackToOverview: () => void;
};

import { getNetworkConfig } from "@/lib/networks";

type NetworkConfig = {
  name: string;
  contracts: {
    token: string;
    staking: string;
  };
};

const AddTokenButton = () => {
  const getMetaMaskProvider = () => {
    const eth = window.ethereum;
    if (!eth) return null;
    return Array.isArray(eth.providers)
      ? eth.providers.find((p) => p.isMetaMask)
      : eth.isMetaMask
        ? eth
        : null;
  };

  const handleAddToken = async () => {
    const metaMask = getMetaMaskProvider();
    if (!metaMask) {
      console.error("MetaMask not detected");
      return;
    }

    try {
      await metaMask.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: "0xdF92bA28D17329a7284A5eC230967768D4cb7A89",
            symbol: "FAET",
            decimals: 18,
            image: "https://www.faet.io/images/faeticonblk.png",
          },
        },
      });
    } catch (err: unknown) {
      const error = err as { code?: number };
      if (error?.code === 4001) {
        console.log("User rejected the add token request.");
      } else {
        console.error("Add token failed", err);
      }
    }
  };

  return (
    <button onClick={handleAddToken} className="your-button-class">
      Add FAET to Wallet
    </button>
  );
};

const StakingInterface = ({
  account,
  wrongNetwork,
  selectedNetwork,
  tokenBalance,
  stakedBalance,
  pendingRewards,
  stakeAmount,
  onStakeAmountChange,
  selectedDays,
  onSelectedDaysChange,
  userStakes,
  isLoading,
  onStake,
  onWithdraw,
  onClaimRewards,
  txHash,
  totalRewardsFunded,
  totalStakeWeight = "0",
  topStakers,
  stakingRanges,
  onBackToOverview,
}: StakingInterfaceProps) => {
  const networkConfig = getNetworkConfig(selectedNetwork);

  return (
    <motion.div
      id="token-staking"
      initial={{ opacity: 0, y: 20, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="bg-gray-900 p-8 rounded-lg border border-gray-700 mt-6"
    >
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBackToOverview}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          ← Back to Overview
        </button>
        <AddTokenButton
          account={account}
          wrongNetwork={wrongNetwork}
          selectedNetwork={selectedNetwork}
          networkConfig={networkConfig}
        />
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-nocturne-serif-bold">
          Token Staking ({networkConfig.name})
        </h2>
      </div>

      {/* Contract Information */}
      <div className="mb-6 grid md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
          <h3 className="text-lg font-semibold text-green-400 mb-3">
            FaetToken Contract Address
          </h3>
          <a
            href={`https://blockscout.lisk.com/address/${networkConfig.contracts.token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-xs font-mono break-all underline"
          >
            {networkConfig.contracts.token}
          </a>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
          <h3 className="text-lg font-semibold text-green-400 mb-3">
            FaetStaking Contract Address
          </h3>
          <a
            href={`https://blockscout.lisk.com/address/${networkConfig.contracts.staking}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-xs font-mono break-all underline"
          >
            {networkConfig.contracts.staking}
          </a>
        </div>
      </div>

      <UserBalance
        tokenBalance={tokenBalance}
        stakedBalance={stakedBalance}
        userStakesCount={userStakes.length}
        totalStakeWeight={totalStakeWeight}
        userStakes={userStakes}
      />

      <StakingForm
        stakeAmount={stakeAmount}
        selectedDays={selectedDays}
        tokenBalance={tokenBalance}
        stakedBalance={stakedBalance}
        isLoading={isLoading}
        wrongNetwork={wrongNetwork}
        txHash={txHash}
        totalStakeWeight={totalStakeWeight || "0"}
        onStakeAmountChange={onStakeAmountChange}
        onSelectedDaysChange={onSelectedDaysChange}
        onStake={onStake}
      />

      <UserStakes
        userStakes={userStakes}
        isLoading={isLoading}
        wrongNetwork={wrongNetwork}
        onWithdraw={onWithdraw}
      />

      <RewardsSection
        pendingRewards={pendingRewards}
        totalRewardsFunded={totalRewardsFunded}
        stakedBalance={stakedBalance}
        totalStakeWeight={totalStakeWeight}
        isLoading={isLoading}
        wrongNetwork={wrongNetwork}
        topStakers={topStakers}
        stakingRanges={stakingRanges}
        onClaimRewards={onClaimRewards}
      />

      {/* Disclaimer Section */}
      <div className="mt-8 bg-yellow-900 border border-yellow-600 p-4 rounded-lg">
        <h3 className="text-yellow-400 font-semibold mb-2 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Important Disclaimer
        </h3>
        <div className="text-yellow-200 text-sm space-y-2">
          <p>
            <strong>Use at Your Own Risk:</strong> This staking utility is
            provided &quot;as is&quot; without any guarantees or warranties.
            FaetStudio provides no guarantee regarding the functionality,
            security, or reliability of this service.
          </p>
          <p>
            <strong>Transaction Responsibility:</strong> Always carefully review
            your transaction details before confirming any operation.
            Double-check contract addresses, amounts, and network settings. You
            are solely responsible for your transactions.
          </p>
          <p>
            <strong>Smart Contract Risk:</strong> Staking involves interacting
            with smart contracts. While we strive for security, smart contracts
            may contain bugs or vulnerabilities. Only stake what you can afford
            to lose.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default StakingInterface;