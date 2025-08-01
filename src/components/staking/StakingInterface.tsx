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

// TypeScript interface for MetaMask wallet_watchAsset method
interface WalletWatchAssetParams {
  type: 'ERC20';
  options: {
    address: string;
    symbol: string;
    decimals: number;
    name: string;
  };
}

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
        <button
          onClick={async () => {
            if (!account) {
              alert("❌ Please connect your wallet first!");
              return;
            }

            if (wrongNetwork) {
              alert("❌ Please switch to the correct network first!");
              return;
            }

            if (
              typeof window.ethereum !== "undefined" &&
              window.ethereum.request
            ) {
              try {
                console.log("Adding FAET token to MetaMask...");
                console.log("Selected network:", selectedNetwork);
                console.log("Token address:", networkConfig.contracts.token);
                
                // Validate token address
                const isValidAddress = (address: string): boolean => {
                  return /^0x[a-fA-F0-9]{40}$/.test(address);
                };

                if (!networkConfig.contracts.token || !isValidAddress(networkConfig.contracts.token)) {
                  throw new Error("Invalid token contract address");
                }

                // Use the correct params format for wallet_watchAsset
                const tokenParams = {
                  type: "ERC20" as const,
                  options: {
                    address: networkConfig.contracts.token,
                    symbol: selectedNetwork === "mainnet" ? "FAET" : "tFAET",
                    decimals: 18,
                    name: selectedNetwork === "mainnet" ? "FAET Token" : "Test FAET Token",
                  },
                };

                console.log("Token params:", tokenParams);

                const wasAdded = await window.ethereum.request({
                  method: "wallet_watchAsset",
                  params: tokenParams as WalletWatchAssetParams,
                });

                if (wasAdded) {
                  console.log("FAET token successfully added to MetaMask!");
                  alert(`✅ ${selectedNetwork === "mainnet" ? "FAET" : "Test FAET"} token added to MetaMask!`);
                } else {
                  console.log("User declined to add FAET token");
                  alert("ℹ️ Token addition was cancelled.");
                }
              } catch (error) {
                console.error("Error adding FAET token:", error);
                
                // Enhanced error handling
                if (error && typeof error === 'object') {
                  const errorObj = error as Record<string, unknown>;
                  
                  // Check for specific error codes
                  if (errorObj.code === 4001 || errorObj.message?.toString().includes("User rejected")) {
                    console.log("User rejected the request");
                    alert("ℹ️ Token addition was cancelled by user.");
                  } else if (errorObj.code === -32002) {
                    alert("⚠️ Request already pending in MetaMask. Please check your wallet.");
                  } else if (errorObj.code === -32603) {
                    alert("❌ Internal error occurred. The token contract may not exist on this network.");
                  } else if (errorObj.message?.toString().includes("Invalid token contract address")) {
                    alert("❌ Invalid token contract address. Please contact support.");
                  } else {
                    // For any other error, provide detailed info
                    const errorMessage = errorObj.message?.toString() || 
                                       errorObj.reason?.toString() || 
                                       JSON.stringify(errorObj);
                    alert(`❌ Failed to add token: ${errorMessage}\n\nYou can manually add it using:\nAddress: ${networkConfig.contracts.token}\nSymbol: ${selectedNetwork === "mainnet" ? "FAET" : "tFAET"}\nDecimals: 18`);
                  }
                } else {
                  alert(`❌ Failed to add token. You can manually add it using:\nAddress: ${networkConfig.contracts.token}\nSymbol: ${selectedNetwork === "mainnet" ? "FAET" : "tFAET"}\nDecimals: 18`);
                }
              }
            } else {
              alert("❌ MetaMask is not installed or not available!");
            }
          }}
          disabled={!account || wrongNetwork}
          className={`font-bold py-2 px-4 rounded-lg text-sm transition-colors ${
            !account || wrongNetwork
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {selectedNetwork === "mainnet"
            ? "Add FAET Token to MetaMask"
            : "Add Test FAET Token to MetaMask"}
        </button>
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
