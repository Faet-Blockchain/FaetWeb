"use client";
import React, { useState, useCallback } from "react";
import { sanitizeInput, sanitizeNumericInput } from "@/lib/security";
import { SecurityLogger } from "@/lib/logger";

// Rate limiting for staking operations
const STAKING_RATE_LIMIT = 3000; // 3 seconds between operations
let lastStakingOperation = 0;

const checkStakingRateLimit = (): boolean => {
  const now = Date.now();
  if (now - lastStakingOperation < STAKING_RATE_LIMIT) {
    return false;
  }
  lastStakingOperation = now;
  return true;
};

type StakingFormProps = {
  stakeAmount: string;
  selectedDays: number;
  tokenBalance: string;
  isLoading: boolean;
  wrongNetwork: boolean;
  txHash: string;
  stakedBalance: string;
  totalStakeWeight: string;
  onStakeAmountChange: (amount: string) => void;
  onSelectedDaysChange: (days: number) => void;
  onStake: () => void;
};

// Calculate multiplier based on days - linear from 1x to 10x over 1095 days (3 years)
const calculateMultiplier = (days: number): number => {
  if (days === 0) return 1.0;
  if (days >= 1095) return 10.0;
  return 1 + (days * 9) / 1095;
};

// Security: Stake limits
const MIN_STAKE_AMOUNT = 1; // 1 FAET minimum
const MAX_STAKE_AMOUNT = 1000000000; // 1 billion FAET maximum

const StakingForm = ({
  stakeAmount,
  selectedDays,
  tokenBalance,
  isLoading,
  wrongNetwork,
  txHash,
  stakedBalance,
  totalStakeWeight = "0",
  onStakeAmountChange,
  onSelectedDaysChange,
  onStake,
}: StakingFormProps) => {
  
  // Calculate potential weighted amount for current input
  const calculatePotentialWeight = (): number => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return 0;
    const amount = parseFloat(stakeAmount);
    const multiplier = calculateMultiplier(selectedDays);
    return amount * multiplier;
  };

  // Calculate total user stake weight (existing + new stake)
  const calculateTotalUserWeight = (): number => {
    const existingWeight = parseFloat(stakedBalance) || 0;
    const newWeight = calculatePotentialWeight();
    return existingWeight + newWeight;
  };

  // Calculate total stake weight including user's current stakes and potential new stake
  const calculateTotalStakeWeight = (): number => {
    const currentTotal = parseFloat(totalStakeWeight) || 0;
    const potentialWeight = calculatePotentialWeight();
    return currentTotal + potentialWeight;
  };

  // Calculate user's weighted percentage share
  const calculateWeightedPercentage = (): number => {
    const totalWeight = calculateTotalStakeWeight();
    if (totalWeight === 0) return 0;
    
    const userTotalWeight = calculateTotalUserWeight();
    
    return (userTotalWeight / totalWeight) * 100;
  };

  // Validate stake amount with sanitization
  const isValidStakeAmount = (): boolean => {
    if (!stakeAmount) return false;
    
    // Sanitize numeric input
    const sanitized = sanitizeNumericInput(stakeAmount);
    const amount = parseFloat(sanitized);
    
    // Security: Log suspicious input patterns
    if (sanitized !== stakeAmount) {
      SecurityLogger.logSecurityEvent('Potentially malicious input detected in stake amount', {
        original: stakeAmount,
        sanitized: sanitized
      });
    }
    
    return !isNaN(amount) && amount >= MIN_STAKE_AMOUNT && amount <= MAX_STAKE_AMOUNT && amount <= parseFloat(tokenBalance);
  };

  // Enhanced stake handler with security checks
  const handleStake = useCallback(() => {
    // Rate limiting check
    if (!checkStakingRateLimit()) {
      SecurityLogger.logSecurityEvent('Rate limit exceeded for staking operation');
      alert('Please wait before making another staking transaction');
      return;
    }

    // Input validation
    if (!isValidStakeAmount()) {
      SecurityLogger.logSecurityEvent('Invalid stake amount attempted', {
        amount: stakeAmount,
        balance: tokenBalance
      });
      return;
    }

    // Log successful operation attempt
    SecurityLogger.log({
      level: 'info',
      message: 'Stake operation initiated',
      extra: {
        amount: parseFloat(stakeAmount),
        days: selectedDays
      }
    });

    try {
      onStake();
    } catch (error) {
      SecurityLogger.log({
        level: 'error',
        message: 'Stake operation failed',
        extra: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }, [stakeAmount, selectedDays, tokenBalance, onStake]);
  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-6">
      <h3 className="text-xl font-nocturne-serif-bold mb-4">
        Stake FAET Tokens
      </h3>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Lock Duration: {selectedDays} days
        </label>
        <div className="mb-3">
          <input
            type="range"
            min="0"
            max="1095"
            step="1"
            value={selectedDays}
            onChange={(e) => onSelectedDaysChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(selectedDays / 1095) * 100}%, #374151 ${(selectedDays / 1095) * 100}%, #374151 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 days (1.00x)</span>
            <span>365 days ({calculateMultiplier(365).toFixed(2)}x)</span>
            <span>730 days ({calculateMultiplier(730).toFixed(2)}x)</span>
            <span>1095 days (10.00x)</span>
          </div>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Multiplier:</span>
            <span className="text-lg font-bold text-purple-400">
              {calculateMultiplier(selectedDays).toFixed(2)}x
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-gray-300">Lock Period:</span>
            <span className="text-sm text-blue-400">
              {selectedDays === 0 ? "No Lock" : `${selectedDays} days`}
            </span>
          </div>
          {stakeAmount && parseFloat(stakeAmount) > 0 && (
            <>
              <div className="border-t border-gray-600 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Your Stake Weight:</span>
                <span className="text-sm font-bold text-green-400">
                  {calculateTotalUserWeight().toFixed(2)} FAET
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Existing: {parseFloat(stakedBalance).toFixed(2)} + New: {calculatePotentialWeight().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-300">Total Stake Weight:</span>
                <span className="text-sm text-yellow-400">
                  {calculateTotalStakeWeight().toFixed(2)} FAET
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-300">Your Weighted %:</span>
                <span className="text-sm font-bold text-orange-400">
                  {calculateWeightedPercentage().toFixed(4)}%
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between">
          <label className="block text-sm font-medium">Amount to Stake</label>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="number"
                placeholder={`Min: ${MIN_STAKE_AMOUNT}, Max: ${MAX_STAKE_AMOUNT.toLocaleString()}`}
                value={stakeAmount}
                min={MIN_STAKE_AMOUNT}
                max={Math.min(MAX_STAKE_AMOUNT, parseFloat(tokenBalance) || 0)}
                onChange={(e) => {
                  const sanitized = sanitizeNumericInput(e.target.value);
                  onStakeAmountChange(sanitized);
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 h-10"
              />
              <button
                type="button"
                onClick={() => {
                  const maxAllowed = Math.min(MAX_STAKE_AMOUNT, parseFloat(tokenBalance) || 0);
                  onStakeAmountChange(maxAllowed.toString());
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded transition-colors"
              >
                MAX
              </button>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <button
              onClick={handleStake}
              disabled={
                !stakeAmount ||
                isLoading ||
                wrongNetwork ||
                !isValidStakeAmount()
              }
              className={`font-bold py-2 px-6 rounded-lg transition-colors min-w-[140px] h-10 ${
                !stakeAmount ||
                isLoading ||
                wrongNetwork ||
                !isValidStakeAmount()
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isLoading ? "Processing..." : "Stake Tokens"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-gray-400 text-xs">
            Available: {parseFloat(tokenBalance).toFixed(2)} FAET
          </p>
          <p className="text-gray-500 text-xs">
            Limits: {MIN_STAKE_AMOUNT} - {MAX_STAKE_AMOUNT.toLocaleString()} FAET
          </p>
        </div>
      </div>
      <p className="text-gray-400 text-sm mt-2">
        Staking weights increase with lock time, up to 10x for 1095 days (3 years).
      </p>

      {txHash && (
        <div className="mt-4 p-3 bg-blue-900 border border-blue-600 rounded-lg">
          <p className="text-blue-300 text-sm">Transaction Hash:</p>
          <a
            href={`https://blockscout.lisk.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm font-mono break-all"
          >
            {txHash}
          </a>
        </div>
      )}
    </div>
  );
};

export default StakingForm;
