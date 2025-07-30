"use client";
import React, { useState } from "react";
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type ChartView = 'ranges' | 'topAccounts' | 'topWeighted';

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
  const [chartView, setChartView] = useState<ChartView>('ranges');

  // Process data for top 10 accounts by amount
  const getTopAccountsData = () => {
    if (topStakers.length === 0) return [];
    
    const top10 = topStakers.slice(0, 10);
    const othersWeight = topStakers.slice(10).reduce((sum, staker) => sum + parseFloat(staker.weight), 0);
    
    const data = top10.map((staker, index) => ({
      name: `${staker.address.slice(0, 6)}...${staker.address.slice(-4)}`,
      value: parseFloat(staker.weight),
      fill: `hsl(${(index * 360) / (top10.length + (othersWeight > 0 ? 1 : 0))}, 70%, 50%)`,
    }));

    if (othersWeight > 0) {
      data.push({
        name: `Others (${topStakers.length - 10} accounts)`,
        value: othersWeight,
        fill: `hsl(${(top10.length * 360) / (top10.length + 1)}, 70%, 50%)`,
      });
    }

    return data;
  };

  // Process data for top 10 accounts by weighted amount (same as above for now since we use weight)
  const getTopWeightedData = () => {
    return getTopAccountsData(); // Using same data since topStakers is already sorted by weight
  };

  // Get current chart data based on view
  const getCurrentChartData = () => {
    switch (chartView) {
      case 'ranges':
        return stakingRanges.map((range, index) => ({
          name: `${range.range} (${range.count} addresses)`,
          value: parseFloat(range.totalWeight),
          fill: `hsl(${(index * 360) / stakingRanges.length}, 70%, 50%)`,
        }));
      case 'topAccounts':
        return getTopAccountsData();
      case 'topWeighted':
        return getTopWeightedData();
      default:
        return [];
    }
  };

  // Get current chart title
  const getCurrentChartTitle = () => {
    switch (chartView) {
      case 'ranges':
        return 'Staking Distribution by Amount Range';
      case 'topAccounts':
        return 'Staking Distribution by Amount - Top 10 Accounts';
      case 'topWeighted':
        return 'Staking Distribution by Weighted Amount - Top 10 Accounts';
      default:
        return '';
    }
  };

  // Get current breakdown data for the right panel
  const getCurrentBreakdownData = () => {
    switch (chartView) {
      case 'ranges':
        return stakingRanges;
      case 'topAccounts':
      case 'topWeighted':
        const accountsData = getTopAccountsData();
        return accountsData.map(item => ({
          range: item.name,
          count: item.name.includes('Others') ? topStakers.length - 10 : 1,
          totalWeight: item.value.toString(),
        }));
      default:
        return [];
    }
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h4 className="font-semibold text-purple-400 mb-2 sm:mb-0">
            {getCurrentChartTitle()}
          </h4>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setChartView('ranges')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                chartView === 'ranges'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              Ranges
            </button>
            <button
              onClick={() => setChartView('topAccounts')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                chartView === 'topAccounts'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              Top Accounts
            </button>
            <button
              onClick={() => setChartView('topWeighted')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                chartView === 'topWeighted'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              Top Weighted
            </button>
          </div>
        </div>
        {(stakingRanges.length === 0 && chartView === 'ranges') || (topStakers.length === 0 && chartView !== 'ranges') ? (
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
                    data={getCurrentChartData()}
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
              <h5 className="font-medium text-gray-300 mb-3">
                {chartView === 'ranges' ? 'Range Breakdown' : 'Account Breakdown'}
              </h5>
              <div className="space-y-2">
                {getCurrentBreakdownData().map((item, index) => (
                  <div
                    key={chartView === 'ranges' ? item.range : `${item.range}-${index}`}
                    className="flex justify-between items-center text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: getCurrentChartData()[index]?.fill || `hsl(${(index * 360) / getCurrentBreakdownData().length}, 70%, 50%)`,
                        }}
                      ></div>
                      <span className="text-gray-300">{item.range}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-300">
                        {chartView === 'ranges' ? `${item.count} addresses` : `${item.count} account${item.count > 1 ? 's' : ''}`}
                      </div>
                      <div className="text-purple-400 font-mono text-xs">
                        {parseFloat(item.totalWeight).toLocaleString(undefined, {
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