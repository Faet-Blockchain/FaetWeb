"use client";
import React from "react";
import { motion } from "framer-motion";
import UserBalance from "./UserBalance";
import StakingForm from "./StakingForm";
import UserStakes from "./UserStakes";
import RewardsSection from "./RewardsSection";

type NetworkType = 'testnet' | 'mainnet';

type StakingInterfaceProps = {
  account: string | null;
  isConnecting: boolean;
  wrongNetwork: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onAddNetwork: () => void;
  selectedNetwork: NetworkType;
  onNetworkChange: (network: NetworkType) => void;
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
  topStakers: Array<{address: string, weight: string}>;
  stakingRanges: Array<{range: string, count: number, totalWeight: string}>;
  onBackToOverview: () => void;
};

import { getNetworkConfig } from "@/lib/networks";

const StakingInterface = ({
  account,
  isConnecting,
  wrongNetwork,
  onConnect,
  onDisconnect,
  onAddNetwork,
  selectedNetwork,
  onNetworkChange,
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
        <button
          onClick={async () => {
            if (typeof window.ethereum !== "undefined") {
              try {
                const wasAdded = await window.ethereum.request({
                  method: 'wallet_watchAsset',
                  params: {
                    type: 'ERC20',
                    options: {
                      address: networkConfig.contracts.token,
                      symbol: 'FAET',
                      decimals: 18,
                      image: 'https://your-domain.com/faet-token-icon.png',
                    },
                  },
                });

                if (wasAdded) {
                  console.log(`${selectedNetwork === 'mainnet' ? 'FAET' : 'Test FAET'} token added to wallet!`);
                } else {
                  console.log(`User cancelled adding ${selectedNetwork === 'mainnet' ? 'FAET' : 'Test FAET'} token`);
                }
              } catch (error) {
                console.error(`Error adding ${selectedNetwork === 'mainnet' ? 'FAET' : 'Test FAET'} token:`, error);
              }
            }
          }}
          disabled={!account || wrongNetwork}
          className={`font-bold py-2 px-4 rounded-lg text-sm transition-colors ${
            !account || wrongNetwork
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {selectedNetwork === 'mainnet' ? 'Add FAET Token to MetaMask' : 'Add Test FAET Token to MetaMask'}
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-nocturne-serif-bold">
          Token Staking ({networkConfig.name})
        </h2>
      </div>

      {/* Network Information */}
      <div className="mb-6">
        <p className="text-gray-400">
          Network: {networkConfig.name}
        </p>
        <p className="text-gray-400">
          Token Contract: {networkConfig.contracts.token}
        </p>
        <p className="text-gray-400">
          Staking Contract: {networkConfig.contracts.staking}
        </p>
      </div>

      <UserBalance
        tokenBalance={tokenBalance}
        stakedBalance={stakedBalance}
        userStakesCount={userStakes.length}
      />

      <StakingForm
        stakeAmount={stakeAmount}
        selectedDays={selectedDays}
        tokenBalance={tokenBalance}
        isLoading={isLoading}
        wrongNetwork={wrongNetwork}
        txHash={txHash}
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
        isLoading={isLoading}
        wrongNetwork={wrongNetwork}
        topStakers={topStakers}
        stakingRanges={stakingRanges}
        onClaimRewards={onClaimRewards}
      />


    </motion.div>
  );
};

export default StakingInterface;