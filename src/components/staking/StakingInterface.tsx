
"use client";
import React from "react";
import { motion } from "framer-motion";
import UserBalance from "./UserBalance";
import StakingForm from "./StakingForm";
import UserStakes from "./UserStakes";
import RewardsSection from "./RewardsSection";

type StakingInterfaceProps = {
  account: string;
  tokenBalance: string;
  stakedBalance: string;
  pendingRewards: string;
  stakeAmount: string;
  selectedDays: number;
  userStakes: any[];
  isLoading: boolean;
  txHash: string;
  wrongNetwork: boolean;
  totalRewardsFunded: string;
  topStakers: Array<{address: string, weight: string}>;
  stakingRanges: Array<{range: string, count: number, totalWeight: string}>;
  onStakeAmountChange: (amount: string) => void;
  onSelectedDaysChange: (days: number) => void;
  onStake: () => void;
  onWithdraw: (stakeIndex: number) => void;
  onClaimRewards: () => void;
  onBackToOverview: () => void;
};

// Contract addresses on Lisk Sepolia
const FAET_TOKEN_ADDRESS = "0x80fD38fFDE3E77fAcE192Ea74fD510618C50f394";
const FAET_STAKING_ADDRESS = "0x9E9444d4dD359666De79B46e6fADF1E97B5c116E";

const StakingInterface = ({
  account,
  tokenBalance,
  stakedBalance,
  pendingRewards,
  stakeAmount,
  selectedDays,
  userStakes,
  isLoading,
  txHash,
  wrongNetwork,
  totalRewardsFunded,
  topStakers,
  stakingRanges,
  onStakeAmountChange,
  onSelectedDaysChange,
  onStake,
  onWithdraw,
  onClaimRewards,
  onBackToOverview,
}: StakingInterfaceProps) => {
  return (
    <motion.div
      id="token-staking"
      initial={{ opacity: 0, y: 20, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="bg-gray-900 p-8 rounded-lg border border-gray-700 mt-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-nocturne-serif-bold">
          Token Staking (Testnet)
        </h2>
        <button
          onClick={async () => {
            if (typeof window.ethereum !== "undefined") {
              try {
                const wasAdded = await window.ethereum.request({
                  method: 'wallet_watchAsset',
                  params: {
                    type: 'ERC20',
                    options: {
                      address: FAET_TOKEN_ADDRESS,
                      symbol: 'FAET',
                      decimals: 18,
                      image: 'https://your-domain.com/faet-token-icon.png',
                    },
                  },
                });

                if (wasAdded) {
                  console.log('✅ FAET token successfully added to wallet');
                } else {
                  console.log('ℹ️ Token addition was not completed');
                }
              } catch (error: any) {
                if (error?.code === 4001) {
                  console.log('ℹ️ User cancelled adding token to wallet');
                } else if (error?.code === -32002) {
                  console.log('⚠️ Request already pending in MetaMask');
                } else {
                  console.warn('⚠️ Error adding token to wallet:', error?.message || 'Unknown error');
                }
              }
            } else {
              console.warn('⚠️ MetaMask not detected');
            }
          }}
          disabled={!account || wrongNetwork}
          className={`font-bold py-2 px-4 rounded-lg text-sm transition-colors ${
            !account || wrongNetwork
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          Add Test Token to Metamask
        </button>
      </div>

      {/* Contract Addresses */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-400 mb-2">Token Contract</h4>
          <a
            href={`https://sepolia-blockscout.lisk.com/address/${FAET_TOKEN_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 font-mono text-xs break-all"
          >
            {FAET_TOKEN_ADDRESS}
          </a>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="font-semibold text-green-400 mb-2">Staking Contract</h4>
          <a
            href={`https://sepolia-blockscout.lisk.com/address/${FAET_STAKING_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 font-mono text-xs break-all"
          >
            {FAET_STAKING_ADDRESS}
          </a>
        </div>
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

      <div className="mt-6 text-center">
        <button
          onClick={onBackToOverview}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Back to Overview
        </button>
      </div>
    </motion.div>
  );
};

export default StakingInterface;
