
"use client";
import React from "react";

type TokenApprovalProps = {
  approvedAmount: string;
  approvalAmount: string;
  tokenBalance: string;
  isLoading: boolean;
  wrongNetwork: boolean;
  onApprovalAmountChange: (amount: string) => void;
  onApprove: () => void;
};

const TokenApproval = ({
  approvedAmount,
  approvalAmount,
  tokenBalance,
  isLoading,
  wrongNetwork,
  onApprovalAmountChange,
  onApprove
}: TokenApprovalProps) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-6">
      <h3 className="text-xl font-bold mb-4">Token Approval</h3>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300">Current Approved Amount:</span>
          <span className="text-lg font-bold text-green-400">
            {parseFloat(approvedAmount).toFixed(2)} FAET
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          This is the amount the staking contract can spend on your behalf. You need approval before staking.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="number"
                placeholder="Amount to approve"
                value={approvalAmount}
                onChange={(e) => onApprovalAmountChange(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none h-10"
              />
              <button
                type="button"
                onClick={() => onApprovalAmountChange(tokenBalance)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded transition-colors"
              >
                MAX
              </button>
            </div>
          </div>
          <div className="flex">
            <button
              onClick={onApprove}
              disabled={
                !approvalAmount ||
                isLoading ||
                wrongNetwork ||
                parseFloat(approvalAmount) <= 0 ||
                parseFloat(approvalAmount) > parseFloat(tokenBalance)
              }
              className={`font-bold py-2 px-6 rounded-lg transition-colors min-w-[100px] h-10 ${
                !approvalAmount ||
                isLoading ||
                wrongNetwork ||
                parseFloat(approvalAmount) <= 0 ||
                parseFloat(approvalAmount) > parseFloat(tokenBalance)
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {isLoading ? "Processing..." : "Approve"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenApproval;
