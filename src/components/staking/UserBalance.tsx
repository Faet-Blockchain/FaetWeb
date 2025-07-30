
"use client";
import React from "react";

type UserBalanceProps = {
  tokenBalance: string;
  stakedBalance: string;
  userStakesCount: number;
  totalStakeWeight?: string;
  userStakes?: Array<{
    index: number;
    amount: string;
    weightedAmount: string;
    multiplier: number;
    lockEndBlock: number;
    isUnlocked: boolean;
    blocksRemaining: number;
  }>;
};

const UserBalance = ({ tokenBalance, stakedBalance, userStakesCount, totalStakeWeight = "0", userStakes = [] }: UserBalanceProps) => {
  // Calculate user's weighted percentage share
  const calculateWeightedPercentage = (): number => {
    const totalWeight = parseFloat(totalStakeWeight) || 0;
    const userWeight = parseFloat(stakedBalance) || 0;
    
    if (totalWeight === 0 || userWeight === 0) return 0;
    return (userWeight / totalWeight) * 100;
  };

  // Calculate average multiplier from active stakes
  const calculateAverageMultiplier = (): number => {
    if (userStakes.length === 0) return 1.0;
    
    const activeStakes = userStakes.filter(stake => stake.isUnlocked || stake.lockEndBlock === 0);
    if (activeStakes.length === 0) return 1.0;
    
    const totalWeight = activeStakes.reduce((sum, stake) => sum + parseFloat(stake.weightedAmount), 0);
    const totalAmount = activeStakes.reduce((sum, stake) => sum + parseFloat(stake.amount), 0);
    
    if (totalAmount === 0) return 1.0;
    return totalWeight / totalAmount;
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-6">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4 text-purple-400">
          Available Balance
        </h3>
        <p className="text-3xl font-bold mb-2">
          {parseFloat(tokenBalance).toFixed(2)} FAET
        </p>
        <p className="text-gray-400 text-sm">Your wallet balance</p>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4 text-green-400">
          Active Staking Weight
        </h3>
        <p className="text-3xl font-bold mb-2">
          {parseFloat(stakedBalance).toFixed(2)} FAET
        </p>
        <div className="space-y-1">
          <p className="text-gray-400 text-sm">
            {userStakes.filter(stake => !stake.isUnlocked).length} locked stakes
          </p>
          {userStakes.length > 0 && (
            <>
              <p className="text-blue-400 text-sm">
                Avg Multiplier: {calculateAverageMultiplier().toFixed(2)}x
              </p>
              <p className="text-orange-400 text-sm">
                Network Share: {calculateWeightedPercentage().toFixed(4)}%
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserBalance;
