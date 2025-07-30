"use client";
import React from "react";
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
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
          onClick={() => {
            console.log("🎁 Claim Rewards button clicked with:", {
              pendingRewards,
              totalRewardsFunded,
              isLoading,
              wrongNetwork,
              canClaim: parseFloat(pendingRewards) > 0 && parseFloat(totalRewardsFunded) > 0
            });
            
            try {
              onClaimRewards();
            } catch (error) {
              console.error("Error during claim rewards:", error);
            }
          }}
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

      {/* Top Stakers Section */}
      <div className="bg-gray-700 p-6 rounded-lg mb-6">
        <h4 className="font-semibold text-green-400 mb-4">
          Top Stakers
        </h4>
        {topStakers.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            <div className="animate-pulse">Loading top stakers...</div>
          </div>
        ) : (
          <div className="space-y-3">
            {topStakers.map((staker, index) => (
              <div key={staker.address} className="flex justify-between items-center p-3 bg-gray-600 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-orange-600 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-mono text-gray-300">
                      {staker.address.slice(0, 6)}...{staker.address.slice(-4)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold">
                    {parseFloat(staker.weight).toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })} FAET
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Staking Distribution Chart */}
      <div className="bg-gray-700 p-6 rounded-lg">
        <h4 className="font-semibold text-purple-400 mb-4">
          Staking Distribution by Amount Range
        </h4>
        {stakingRanges.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="animate-pulse">Loading staking distribution data...</div>
            <div className="text-xs mt-2">Fetching data from blockchain...</div>
          </div>
        ) : (
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
                    label={({ percent }: { percent?: number }) =>
                      percent && percent > 0.05 ? `${(percent * 100).toFixed(1)}%` : ""
                    }
                    labelLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `${value.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })} FAET`,
                      "Total Weight",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h5 className="font-medium text-gray-300 mb-3">Range Breakdown</h5>
              <div className="space-y-2">
                {stakingRanges.map((range, index) => (
                  <div
                    key={range.range}
                    className="flex justify-between items-center text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: `hsl(${(index * 360) / stakingRanges.length}, 70%, 50%)`,
                        }}
                      ></div>
                      <span className="text-gray-300">{range.range}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-300">{range.count} addresses</div>
                      <div className="text-purple-400 font-mono text-xs">
                        {parseFloat(range.totalWeight).toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}{" "}
                        FAET
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsSection;