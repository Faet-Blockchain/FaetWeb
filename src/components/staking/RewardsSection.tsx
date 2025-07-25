"use client";
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

type RewardsSectionProps = {
  pendingRewards: string;
  totalRewardsFunded: string;
  stakedBalance: string;
  isLoading: boolean;
  wrongNetwork: boolean;
  topStakers: Array<{ address: string; weight: string }>;
  stakingRanges: Array<{ range: string; count: number; totalWeight: string }>;
  onClaimRewards: () => void;
};

const RewardsSection = ({
  pendingRewards,
  totalRewardsFunded,
  stakedBalance,
  isLoading,
  wrongNetwork,
  topStakers,
  stakingRanges,
  onClaimRewards,
}: RewardsSectionProps) => {
  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      console.log("✅ Address copied to clipboard:", address);
    } catch (error) {
      console.warn("⚠️ Failed to copy address to clipboard:", error);
      const textArea = document.createElement("textarea");
      textArea.value = address;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  };

  const formatAddress = (address: string): string => {
    if (!address || address.length < 8) return address;
    return `${address.slice(0, 5)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-xl font-bold mb-4 text-yellow-400">Rewards</h3>

      {/* Reward Pool Status */}
      <div className="mb-4 p-3 rounded-lg bg-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Reward Pool:</span>
          <span
            className={`text-sm font-bold ${
              parseFloat(totalRewardsFunded) > 0
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {parseFloat(totalRewardsFunded).toFixed(2)} FAET
          </span>
        </div>
        {parseFloat(totalRewardsFunded) === 0 && (
          <p className="text-xs text-red-400 mt-1">
            ⚠️ Reward pool is empty. Claims are not possible until rewards are
            funded.
          </p>
        )}
      </div>

      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-gray-400">Pending Rewards</p>
          <p className="text-2xl font-bold">
            {parseFloat(pendingRewards).toFixed(6)} FAET
          </p>
          <p className="text-xs text-blue-400 mt-1">
            Next block: +
            {stakedBalance && parseFloat(stakedBalance) > 0
              ? (
                  (parseFloat(stakedBalance) * 1.0) /
                  Math.max(1, parseFloat(stakedBalance))
                ).toFixed(6)
              : "0.000000"}{" "}
            FAET
          </p>
        </div>
        <button
          onClick={onClaimRewards}
          disabled={
            parseFloat(pendingRewards) === 0 ||
            parseFloat(totalRewardsFunded) === 0 ||
            isLoading ||
            wrongNetwork
          }
          className={`font-bold py-2 px-6 rounded-lg transition-colors ${
            parseFloat(pendingRewards) === 0 ||
            parseFloat(totalRewardsFunded) === 0 ||
            isLoading ||
            wrongNetwork
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-yellow-600 hover:bg-yellow-700 text-white"
          }`}
          title={
            parseFloat(totalRewardsFunded) === 0
              ? "Reward pool is empty - cannot claim rewards"
              : parseFloat(pendingRewards) === 0
                ? "No rewards available to claim"
                : "Claim your pending rewards"
          }
        >
          {isLoading ? "Processing..." : "Claim Rewards"}
        </button>
      </div>
      <p className="text-gray-400 text-sm mb-6">
        Rate: Each block (~2 seconds) 1 Faet is distributed to all stakers based
        on their weighted staked amount.
      </p>

      {/* Staking Distribution Chart */}
      <div className="bg-gray-700 p-6 rounded-lg">
        <h4 className="font-semibold text-purple-400 mb-4">
          Staking Distribution by Amount Range
        </h4>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stakingRanges.map((range, index) => ({
                    name: `${range.range} (${range.count} addresses)`,
                    value: parseFloat(range.totalWeight),
                    fill: `hsl(${(index * 360) / stakingRanges.length}, 70%, 50%)`,
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) =>
                    percent > 5 ? `${(percent * 100).toFixed(1)}%` : ""
                  }
                  labelLine={false}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value.toLocaleString()} FAET`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: "#374151",
                    border: "1px solid #4b5563",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend
                  wrapperStyle={{ color: "#fff", fontSize: "12px" }}
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-600 p-4 rounded-lg">
              <h5 className="font-semibold text-purple-400 mb-2">
                Top 10 Stakers
              </h5>
              <div className="space-y-2 text-sm max-h-64 overflow-y-auto">
                {topStakers.length === 0 ? (
                  <div className="text-gray-400 text-center py-4">
                    Loading stakers data...
                  </div>
                ) : (
                  topStakers.map((staker, index) => (
                    <div
                      key={staker.address}
                      className="flex justify-between items-center"
                    >
                      <span className="text-gray-300 min-w-[25px]">
                        {index + 1}.
                      </span>
                      <button
                        onClick={() => copyToClipboard(staker.address)}
                        className="font-mono text-blue-400 hover:text-blue-300 transition-colors cursor-pointer text-xs flex-1 text-center"
                        title={`Click to copy: ${staker.address}`}
                      >
                        {formatAddress(staker.address)}
                      </button>
                      <span className="font-mono text-purple-400 text-xs min-w-[80px] text-right">
                        {parseFloat(staker.weight).toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}{" "}
                        FAET
                      </span>
                    </div>
                  ))
                )}
                <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-500">
                  * Click addresses to copy to clipboard
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardsSection;
