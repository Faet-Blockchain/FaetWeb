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

type AddTokenButtonProps = {
  account: string | null;
  wrongNetwork: boolean;
  selectedNetwork: "testnet" | "mainnet";
  networkConfig: any;
};

const AddTokenButton = ({ account, wrongNetwork, selectedNetwork, networkConfig }: AddTokenButtonProps) => {
  const [status, setStatus] = React.useState<'idle' | 'adding' | 'success' | 'error' | 'cancelled'>('idle');
  const [errorMessage, setErrorMessage] = React.useState<string>('');

  const handleAddToken = async () => {
    if (!account) {
      setStatus('error');
      setErrorMessage('Please connect your wallet first');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    if (wrongNetwork) {
      setStatus('error');
      setErrorMessage('Please switch to the correct network first');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    if (typeof window === "undefined" || !window.ethereum) {
      setStatus('error');
      setErrorMessage('MetaMask is not installed or not available');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    setStatus('adding');
    setErrorMessage('');

    try {
      const isValidAddress = (address: string): boolean => {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      };

      const tokenAddress = networkConfig.contracts.token;
      if (!tokenAddress || !isValidAddress(tokenAddress)) {
        throw new Error("Invalid token contract address");
      }

      const tokenParams = {
        type: "ERC20" as const,
        options: {
          address: tokenAddress,
          symbol: selectedNetwork === "mainnet" ? "FAET" : "tFAET",
          decimals: 18,
          name: selectedNetwork === "mainnet" ? "FAET Token" : "Test FAET Token",
        },
      };

      const wasAdded = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: [tokenParams],
      });

      if (wasAdded) {
        setStatus('success');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('cancelled');
        setTimeout(() => setStatus('idle'), 2000);
      }
    } catch (error) {
      const err = error as any;
      
      if (err?.code === 4001 || err?.message?.includes("User rejected") || err?.message?.includes("User denied")) {
        setStatus('cancelled');
        setTimeout(() => setStatus('idle'), 2000);
      } else if (err?.code === -32002) {
        setStatus('error');
        setErrorMessage('Request already pending in MetaMask');
        setTimeout(() => setStatus('idle'), 3000);
      } else if (err?.code === -32603) {
        setStatus('error');
        setErrorMessage('Token contract may not exist on this network');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
        setErrorMessage('Failed to add token. Please try again');
        setTimeout(() => setStatus('idle'), 3000);
      }
    }
  };

  const getButtonContent = () => {
    switch (status) {
      case 'adding':
        return (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Adding Token...
          </>
        );
      case 'success':
        return (
          <>
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Token Added!
          </>
        );
      case 'cancelled':
        return (
          <>
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Cancelled
          </>
        );
      case 'error':
        return (
          <>
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Error
          </>
        );
      default:
        return `Add ${selectedNetwork === "mainnet" ? "FAET" : "Test FAET"} Token to MetaMask`;
    }
  };

  const getButtonClass = () => {
    const baseClass = "font-bold py-2 px-4 rounded-lg text-sm transition-colors flex items-center";
    
    if (!account || wrongNetwork) {
      return `${baseClass} bg-gray-600 text-gray-400 cursor-not-allowed`;
    }

    switch (status) {
      case 'adding':
        return `${baseClass} bg-yellow-600 text-white cursor-wait`;
      case 'success':
        return `${baseClass} bg-green-600 text-white`;
      case 'cancelled':
        return `${baseClass} bg-gray-600 text-gray-300`;
      case 'error':
        return `${baseClass} bg-red-600 text-white`;
      default:
        return `${baseClass} bg-blue-600 hover:bg-blue-700 text-white`;
    }
  };

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={handleAddToken}
        disabled={!account || wrongNetwork || status === 'adding'}
        className={getButtonClass()}
      >
        {getButtonContent()}
      </button>
      {status === 'error' && errorMessage && (
        <div className="mt-2 text-red-400 text-xs text-right max-w-xs">
          {errorMessage}
        </div>
      )}
    </div>
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
