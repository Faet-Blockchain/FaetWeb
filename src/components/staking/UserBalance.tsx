"use client";
import React from "react";

// Add FAET token to MetaMask component
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
    <button
      onClick={handleAddToken}
      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2 w-full justify-center"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
          clipRule="evenodd"
        />
      </svg>
      Add FAET to Wallet
    </button>
  );
};

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

const UserBalance = ({ tokenBalance, stakedBalance, totalStakeWeight = "0", userStakes = [] }: UserBalanceProps) => {
  // Calculate user's weighted percentage share (matches StakingForm calculation)
  const calculateWeightedPercentage = (): number => {
    const userWeight = parseFloat(stakedBalance) || 0;
    const totalWeight = parseFloat(totalStakeWeight) || 0;

    if (totalWeight === 0 || userWeight === 0) return 0;

    // Use the same calculation as StakingForm - user's percentage of total network weight
    const percentage = (userWeight / totalWeight) * 100;

    return percentage;
  };

  // Calculate average multiplier from all stakes (including locked and unlocked)
  const calculateAverageMultiplier = (): number => {
    if (userStakes.length === 0) return 1.0;

    const totalWeight = userStakes.reduce((sum, stake) => sum + parseFloat(stake.weightedAmount), 0);
    const totalAmount = userStakes.reduce((sum, stake) => sum + parseFloat(stake.amount), 0);

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
            {userStakes.length} total stakes ({userStakes.filter(stake => !stake.isUnlocked).length} locked, {userStakes.filter(stake => stake.isUnlocked).length} unlocked)
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

    {/* Add FAET Token to MetaMask Button */}
    <div className="mt-4">
      <AddTokenButton />
    </div>
  );
};

export default UserBalance;