"use client";
import React from "react";
import { PieChart, Pie, ResponsiveContainer, Tooltip } from "recharts";

type RewardsSectionProps = {
  pendingRewards: string;
  totalRewardsFunded: string;
  stakedBalance: string;
  totalStakeWeight: string;
  isLoading: boolean;
  wrongNetwork: boolean;
  topStakers: Array<{ address: string; weight: string; rawAmount?: string }>;
  onClaimRewards: () => void;
};

const RewardsSection = ({
  pendingRewards,
  totalRewardsFunded,
  stakedBalance,
  totalStakeWeight,
  isLoading,
  wrongNetwork,
  topStakers,
  onClaimRewards,
}: RewardsSectionProps) => {
  // Process data for all stakers by weighted amount, showing top 10 individually and grouping others
  const getTopWeightedData = () => {
    if (topStakers.length === 0) return [];

    // Sort by weighted amount (includes multipliers for rewards calculation)
    const sortedByWeight = [...topStakers].sort((a, b) => {
      const aWeight = parseFloat(a.weight || "0");
      const bWeight = parseFloat(b.weight || "0");
      return bWeight - aWeight;
    });

    const top10 = sortedByWeight.slice(0, 10);
    const others = sortedByWeight.slice(10);
    const othersAmount = others.reduce(
      (sum, staker) => sum + parseFloat(staker.weight || "0"),
      0,
    );

    const totalWeight = sortedByWeight.reduce(
      (sum, staker) => sum + parseFloat(staker.weight || "0"),
      0,
    );

    const data = top10.map((staker, index) => ({
      name: `${staker.address.slice(0, 6)}...${staker.address.slice(-4)}`,
      value: parseFloat(staker.weight || "0"),
      fill: `hsl(${(index * 360) / (top10.length + (othersAmount > 0 ? 1 : 0))}, 70%, 50%)`,
      percentage: (parseFloat(staker.weight || "0") / (totalWeight || 1)) * 100,
    }));

    if (othersAmount > 0) {
      data.push({
        name: `Others (${others.length} accounts)`,
        value: othersAmount,
        fill: `hsl(${(top10.length * 360) / (top10.length + 1)}, 70%, 50%)`,
        percentage: (othersAmount / (totalWeight || 1)) * 100,
      });
    }

    return data;
  };

  // Get current breakdown data for the right panel
  const getCurrentBreakdownData = () => {
    const weightedData = getTopWeightedData();
    return weightedData.map((item) => ({
      range: item.name,
      count: item.name.includes("Others") ? topStakers.length - 10 : 1,
      totalWeight: item.value.toString(),
      percentage: item.percentage,
    }));
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
            {stakedBalance && parseFloat(stakedBalance) > 0 && totalStakeWeight
              ? (() => {
                  const userWeight = parseFloat(stakedBalance);
                  const totalWeight = parseFloat(totalStakeWeight);
                  return totalWeight > 0
                    ? ((userWeight / totalWeight) * 1.0).toFixed(6)
                    : "0.000000";
                })()
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
              canClaim:
                parseFloat(pendingRewards) > 0 &&
                parseFloat(totalRewardsFunded) > 0,
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
        Rate: Each block (~2 seconds) 1 Faet is distributed among stakers,
        divided by their weighted staked amount.
      </p>

      {/* Staking Distribution Chart */}
      <div className="bg-gray-700 p-6 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h4 className="font-semibold text-purple-400 mb-2 sm:mb-0">
            Top Weighted Stakers
          </h4>
        </div>
        {topStakers.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="animate-pulse">
              Loading staking distribution data...
            </div>
            <div className="text-xs mt-2">Fetching data from blockchain...</div>
          </div>
        ) : getTopWeightedData().length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div>No staking data available</div>
            <div className="text-xs mt-2">
              There are currently no active stakes to display.
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getTopWeightedData()}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ percent }: { percent?: number }) =>
                      percent && percent > 0.05
                        ? `${(percent * 100).toFixed(1)}%`
                        : ""
                    }
                    labelLine={false}
                  />
                  <Tooltip
                    formatter={(value: any, name: any, props: any) => [
                      `${parseFloat(value).toFixed(2)} FAET (${props.payload.percentage?.toFixed(2)}%)`,
                      "Total Weight",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h5 className="font-medium text-gray-300 mb-3">
                Account Breakdown
              </h5>
              <div className="space-y-3 text-sm">
                {getCurrentBreakdownData().map((item, index) => (
                  <div
                    key={`${item.range}-${index}`}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            getTopWeightedData()[index]?.fill ||
                            `hsl(${(index * 360) / getCurrentBreakdownData().length}, 70%, 50%)`,
                        }}
                      ></div>
                      <span className="text-gray-300 text-xs">
                        {item.range}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">
                        {parseFloat(item.totalWeight).toFixed(2)} FAET
                      </div>
                      <div className="text-gray-400 text-xs">
                        {item.percentage?.toFixed(2)}% • {item.count}{" "}
                        {item.count === 1 ? "account" : "accounts"}
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
