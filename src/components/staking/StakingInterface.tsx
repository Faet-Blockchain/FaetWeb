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
};

// Contract addresses on Lisk Sepolia
const FAET_TOKEN_ADDRESS = "0x80fD38fFDE3E77fAcE192Ea74fD510618C50f394";
const FAET_STAKING_ADDRESS = "0x84B7F164cbAEdb17E98B5EA2512e6c41121E8472";

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
}: StakingInterfaceProps) => {

  const networkConfig = {
    name: selectedNetwork === 'mainnet' ? 'Mainnet' : 'Testnet',
    contracts: {
      token: selectedNetwork === 'mainnet' ? '0x...' : FAET_TOKEN_ADDRESS,
      staking: selectedNetwork === 'mainnet' ? '0x...' : FAET_STAKING_ADDRESS,
    },
  };

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
          onClick={() => {}}
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
              } catch (error: unknown) {
                const errorObj = error as { code?: number; message?: string };
                if (errorObj?.code === 4001) {
                  console.log('ℹ️ User cancelled adding token to wallet');
                } else if (errorObj?.code === -32002) {
                  console.log('⚠️ Request already pending in MetaMask');
                } else {
                  const errorObj = error as { message?: string };
                  console.warn('⚠️ Error adding token to wallet:', errorObj?.message || 'Unknown error');
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