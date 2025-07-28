"use client";
import React from "react";

type UserStakesProps = {
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
  wrongNetwork: boolean;
  onWithdraw: (stakeIndex: number) => void;
};

const UserStakes = ({ userStakes, isLoading, wrongNetwork, onWithdraw }: UserStakesProps) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-6">
      <h3 className="text-xl font-bold mb-4">Your Stakes</h3>

      {userStakes.length === 0 ? (
        <p className="text-gray-400">No active stakes found.</p>
      ) : (
        <div className="space-y-4">
          {userStakes.map((stake, index) => (
            <div key={index} className="bg-gray-700 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Amount</p>
                  <p className="font-bold">
                    {parseFloat(stake.amount).toFixed(2)} FAET
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Multiplier</p>
                  <p className="font-bold text-purple-400">
                    {stake.multiplier.toFixed(2)}x
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${stake.isUnlocked ? "bg-green-400" : "bg-red-400"}`}
                    ></div>
                    <p
                      className={`font-bold text-sm ${stake.isUnlocked ? "text-green-400" : "text-red-400"}`}
                    >
                      {stake.isUnlocked ? "Unlocked" : "Locked"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Lock Info</p>
                  {stake.lockEndBlock === 0 ? (
                    <p className="font-bold text-green-400 text-sm">
                      No Lock
                    </p>
                  ) : stake.isUnlocked ? (
                    <p className="font-bold text-green-400 text-sm">
                      Ready
                    </p>
                  ) : (
                    <div>
                      <p className="font-bold text-red-400 text-sm">
                        ~{Math.ceil(stake.blocksRemaining / 43200)} days left
                      </p>
                      <p className="text-xs text-gray-400">
                        ({stake.blocksRemaining.toLocaleString()} blocks)
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      console.log("💸 Withdraw button clicked for stake:", {
                        stakeIndex: stake.index,
                        isUnlocked: stake.isUnlocked,
                        isLoading,
                        wrongNetwork
                      });
                      
                      try {
                        onWithdraw(stake.index);
                      } catch (error) {
                        console.error("Error during withdraw:", error);
                      }
                    }}
                    disabled={
                      !stake.isUnlocked || isLoading || wrongNetwork
                    }
                    className={`font-bold py-2 px-4 rounded-lg text-sm transition-colors min-w-[100px] ${
                      !stake.isUnlocked || isLoading || wrongNetwork
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    {isLoading
                      ? "Processing..."
                      : stake.isUnlocked
                        ? "Withdraw"
                        : "Locked"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserStakes;