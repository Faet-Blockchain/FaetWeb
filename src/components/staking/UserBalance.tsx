
"use client";
import React from "react";

type UserBalanceProps = {
  tokenBalance: string;
  stakedBalance: string;
  userStakesCount: number;
};

const UserBalance = ({ tokenBalance, stakedBalance, userStakesCount }: UserBalanceProps) => {
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
        <p className="text-gray-400 text-sm">
          {userStakesCount} active stakes
        </p>
      </div>
    </div>
  );
};

export default UserBalance;
