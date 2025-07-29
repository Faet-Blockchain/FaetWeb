
"use client";
import React from "react";
import { getNetworkConfig, type NetworkType, isMainnet } from "@/lib/networks";

type NetworkIndicatorProps = {
  selectedNetwork: NetworkType;
  wrongNetwork: boolean;
  onAddNetwork: () => void;
};

const NetworkIndicator = ({ selectedNetwork, wrongNetwork, onAddNetwork }: NetworkIndicatorProps) => {
  const networkConfig = getNetworkConfig(selectedNetwork);
  
  if (wrongNetwork) {
    return (
      <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-red-400 font-medium">Wrong Network</h3>
            <p className="text-sm text-gray-300">
              Please switch to {networkConfig.name} to continue
            </p>
          </div>
          <button
            onClick={onAddNetwork}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Switch Network
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-4 mb-6 ${
      isMainnet(selectedNetwork) 
        ? 'bg-green-500/20 border-green-500' 
        : 'bg-blue-500/20 border-blue-500'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-medium ${
            isMainnet(selectedNetwork) ? 'text-green-400' : 'text-blue-400'
          }`}>
            Connected to {networkConfig.name}
          </h3>
          <div className="text-sm text-gray-300 space-x-4">
            <span>Chain ID: {networkConfig.chainIdNumber}</span>
            <span>Token: {networkConfig.contracts.token.slice(0, 8)}...</span>
          </div>
        </div>
        {isMainnet(selectedNetwork) && (
          <div className="text-green-400 text-sm font-medium">
            🔒 MAINNET
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkIndicator;
