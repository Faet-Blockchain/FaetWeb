
"use client";
import React from "react";
import { motion } from "framer-motion";

type WalletConnectionProps = {
  account: string | null;
  isConnecting: boolean;
  wrongNetwork: boolean;
  currentChainId: string | null;
  selectedNetwork: 'testnet' | 'mainnet';
  canAccessStaking: boolean;
  onConnect: () => void;
  onSwitchNetwork: () => void;
  onGoToStaking: () => void;
  onDisconnect: () => void;
  onNetworkChange: (network: 'testnet' | 'mainnet') => void;
};

const WalletConnection = ({
  account,
  isConnecting,
  wrongNetwork,
  currentChainId,
  selectedNetwork,
  canAccessStaking,
  onConnect,
  onSwitchNetwork,
  onGoToStaking,
  onDisconnect,
  onNetworkChange
}: WalletConnectionProps) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: "easeInOut", delay: 0.15 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm font-medium">Network:</label>
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => onNetworkChange('mainnet')}
              disabled={true}
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 cursor-not-allowed"
            >
              Mainnet
            </button>
            <button
              onClick={() => onNetworkChange('testnet')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedNetwork === 'testnet'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Testnet
            </button>
          </div>
        </div>
        <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4">
          <p className="text-yellow-300 text-sm">
            ⚠️ <strong>Testnet Only:</strong> Currently, only testnet staking is available. 
            Mainnet functionality will be enabled in a future update.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: "easeInOut", delay: 0.2 }}
        className="bg-gray-900 p-8 rounded-lg border border-gray-700 mb-0"
      >
        <h2 className="text-2xl font-nocturne-serif-bold mb-6">
          Wallet Connection
        </h2>

        {!account ? (
          <div className="text-center">
            <p className="mb-6 text-gray-300">
              Connect your MetaMask wallet to access staking features
            </p>
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center gap-3 mx-auto"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <img
                    src="/images/metamask-icon.png"
                    alt="MetaMask"
                    className="w-6 h-6"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  Connect MetaMask
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-green-900 border border-green-600 rounded-lg p-4 mb-6">
              <p className="text-green-300 mb-2">✅ Wallet Connected</p>
              <p className="text-white font-mono text-sm break-all">
                {account}
              </p>
              {currentChainId && (
                <p className="text-gray-300 text-xs mt-2">
                  Chain ID: {currentChainId}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Token Staking</h3>
                <p className="text-gray-300 mb-4">
                  Stake your FAET tokens to earn rewards
                </p>
                <button
                  onClick={wrongNetwork ? onSwitchNetwork : onGoToStaking}
                  disabled={!account}
                  className={`font-bold py-2 px-6 rounded-lg transition-colors ${
                    wrongNetwork
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : canAccessStaking
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {wrongNetwork ? "Switch Network" : "Go to Staking"}
                </button>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">NFT Staking</h3>
                <p className="text-gray-300 mb-4">
                  Lock your NFTs for exclusive benefits
                </p>
                <button
                  disabled={true}
                  className="bg-gray-600 text-gray-400 cursor-not-allowed font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  Coming Soon
                </button>
              </div>
            </div>

            <button
              onClick={onDisconnect}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default WalletConnection;
