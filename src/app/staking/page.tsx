"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      isMetaMask?: boolean;
    };
  }
}

export default function StakingPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [showTokenStaking, setShowTokenStaking] = useState(false);

  // Lisk Sepolia testnet configuration
  const LISK_SEPOLIA_CHAIN_ID = '0x106a'; // 4202 in decimal
  const LISK_SEPOLIA_CONFIG = {
    chainId: LISK_SEPOLIA_CHAIN_ID,
    chainName: 'Lisk Sepolia Testnet',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.sepolia-api.lisk.com'],
    blockExplorerUrls: ['https://sepolia-blockscout.lisk.com'],
  };

  const checkNetwork = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const chainId = await window.ethereum.request({
          method: 'eth_chainId',
        }) as string;
        
        if (chainId !== LISK_SEPOLIA_CHAIN_ID) {
          setWrongNetwork(true);
          return false;
        } else {
          setWrongNetwork(false);
          return true;
        }
      } catch (error) {
        console.error('Error checking network:', error);
        return false;
      }
    }
    return false;
  };

  const switchToLiskSepolia = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: LISK_SEPOLIA_CHAIN_ID }],
        });
        setWrongNetwork(false);
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [LISK_SEPOLIA_CONFIG],
            });
            setWrongNetwork(false);
          } catch (addError) {
            console.error('Error adding network:', addError);
          }
        } else {
          console.error('Error switching network:', switchError);
        }
      }
    }
  };

  const connectMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      setIsConnecting(true);
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        }) as string[];
        setAccount(accounts[0]);
        
        // Check network after connecting
        await checkNetwork();
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert('MetaMask is not installed. Please install MetaMask to continue.');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setWrongNetwork(false);
    setShowTokenStaking(false);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGoToStaking = () => {
    setShowTokenStaking(true);
    setTimeout(() => scrollToSection('token-staking'), 100);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeInOut" }}
          className="text-5xl md:text-7xl font-nocturne-serif-bold mb-8"
        >
          STAKING
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeInOut", delay: 0.1 }}
          className="text-lg mb-12 max-w-3xl"
        >
          Stake your FAET tokens and NFTs to earn rewards and unlock exclusive platform benefits. 
          Connect your MetaMask wallet to get started with staking on the FAET platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: showTokenStaking ? 0 : 1, 
            y: showTokenStaking ? -20 : 0,
            height: showTokenStaking ? 0 : 'auto'
          }}
          transition={{ duration: 0.5, ease: "easeInOut", delay: showTokenStaking ? 0 : 0.2 }}
          className={`bg-gray-900 p-8 rounded-lg border border-gray-700 overflow-hidden ${showTokenStaking ? 'mb-0' : 'mb-0'}`}
          style={{ display: showTokenStaking ? 'none' : 'block' }}
        >
          <h2 className="text-2xl font-nocturne-serif-bold mb-6">Wallet Connection</h2>

          {!account ? (
            <div className="text-center">
              <p className="mb-6 text-gray-300">
                Connect your MetaMask wallet to access staking features
              </p>
              <button
                onClick={connectMetaMask}
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
                    <img src="/images/metamask-icon.png" alt="MetaMask" className="w-6 h-6" onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }} />
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
              </div>

              {wrongNetwork && (
                <div className="bg-red-900 border border-red-600 rounded-lg p-4 mb-6">
                  <p className="text-red-300 mb-2">⚠️ Wrong Network</p>
                  <p className="text-white mb-4">
                    Please switch to Lisk Sepolia Testnet to access staking features.
                  </p>
                  <button
                    onClick={switchToLiskSepolia}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                  >
                    Switch to Lisk Sepolia
                  </button>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4">Token Staking</h3>
                  <p className="text-gray-300 mb-4">Stake your FAET tokens to earn rewards</p>
                  <button 
                    onClick={wrongNetwork ? switchToLiskSepolia : handleGoToStaking}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                  >
                    {wrongNetwork ? 'Change Network' : 'Go to Staking'}
                  </button>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4">NFT Staking</h3>
                  <p className="text-gray-300 mb-4">Lock your NFTs for exclusive benefits</p>
                  <button 
                    disabled={wrongNetwork}
                    className={`font-bold py-2 px-6 rounded-lg transition-colors ${
                      wrongNetwork 
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    Coming Soon
                  </button>
                </div>
              </div>

              <button
                onClick={disconnectWallet}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Disconnect Wallet
              </button>
            </div>
          )}
        </motion.div>

        {/* Token Staking Container */}
        {showTokenStaking && (
          <motion.div
            id="token-staking"
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="bg-gray-900 p-8 rounded-lg border border-gray-700 mt-6"
          >
            <h2 className="text-2xl font-nocturne-serif-bold mb-6">Token Staking</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-purple-400">Available Balance</h3>
                <p className="text-3xl font-bold mb-2">0 FAET</p>
                <p className="text-gray-400 text-sm">Connect your wallet to see balance</p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-green-400">Staked Amount</h3>
                <p className="text-3xl font-bold mb-2">0 FAET</p>
                <p className="text-gray-400 text-sm">No tokens currently staked</p>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-bold mb-4">Stake FAET Tokens</h3>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Amount to Stake</label>
                  <input
                    type="number"
                    placeholder="0.0"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  disabled
                  className="bg-gray-600 text-gray-400 cursor-not-allowed font-bold py-2 px-6 rounded-lg"
                >
                  Stake Tokens
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-2">Minimum stake: 100 FAET</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-bold mb-4">Unstake FAET Tokens</h3>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Amount to Unstake</label>
                  <input
                    type="number"
                    placeholder="0.0"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  disabled
                  className="bg-gray-600 text-gray-400 cursor-not-allowed font-bold py-2 px-6 rounded-lg"
                >
                  Unstake Tokens
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-2">Unstaking period: 7 days</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-yellow-400">Rewards</h3>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-400">Pending Rewards</p>
                  <p className="text-2xl font-bold">0 FAET</p>
                </div>
                <button
                  disabled
                  className="bg-gray-600 text-gray-400 cursor-not-allowed font-bold py-2 px-6 rounded-lg"
                >
                  Claim Rewards
                </button>
              </div>
              <p className="text-gray-400 text-sm">APY: 12% (estimated)</p>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowTokenStaking(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Back to Overview
              </button>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeInOut", delay: 0.3 }}
          className="mt-12 grid md:grid-cols-3 gap-6"
        >
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-purple-400">Staking Rewards</h3>
            <p className="text-gray-300">
              Earn ERC-20 tokens as rewards for staking your NFTs and participating in the ecosystem.
            </p>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-blue-400">Exclusive Access</h3>
            <p className="text-gray-300">
              Unlock special in-game items, exclusive content, and early access to future NFT drops.
            </p>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-green-400">Platform Benefits</h3>
            <p className="text-gray-300">
              Gain voting rights, reduced fees, and priority access to new features and games.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}