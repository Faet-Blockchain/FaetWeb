"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

type WalletConnectionProps = {
  account: string | null;
  isConnecting: boolean;
  wrongNetwork: boolean;
  currentChainId: string | null;
  selectedNetwork: 'testnet' | 'mainnet';
  canAccessStaking: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSwitchNetwork: () => void;
  onGoToStaking: () => void;
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
  onDisconnect,
  onSwitchNetwork,
  onGoToStaking,
  onNetworkChange,
}: WalletConnectionProps) => {
  const [characterNftError, setCharacterNftError] = useState<string>("");
  const [foundersPassError, setFoundersPassError] = useState<string>("");
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
        transition={{ duration: 0.5, ease: "easeInOut", delay: 0.2 }}
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

            <div className="grid md:grid-cols-3 gap-6 mb-6">
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
                  className="bg-gray-600 text-gray-400 cursor-not-allowed font-bold py-2 px-6 rounded-lg transition-colors mb-2"
                >
                  Coming Soon
                </button>
                <button
                  onClick={async () => {
                    setCharacterNftError(""); // Clear previous error
                    
                    if (typeof window.ethereum === "undefined") {
                      console.error("MetaMask not detected");
                      return;
                    }

                    try {
                      console.log("📝 Attempting to add Test Character NFTs to MetaMask...");
                      
                      let successCount = 0;
                      let totalAttempts = 0;
                      
                      // Try to add multiple token IDs (1-10) for Character NFTs
                      for (let tokenId = 1; tokenId <= 10; tokenId++) {
                        try {
                          totalAttempts++;
                          const wasAdded = await window.ethereum.request({
                            method: 'wallet_watchAsset',
                            params: {
                              type: 'ERC721',
                              options: {
                                address: '0xB37E9A6Df0887663fe0b4Cc9Ba19F8FC0DE18e12',
                                tokenId: tokenId.toString(),
                              },
                            },
                          });

                          if (wasAdded) {
                            successCount++;
                            console.log(`✅ Test Character NFT #${tokenId} successfully added to wallet`);
                          }
                          
                          // Small delay between requests to avoid overwhelming MetaMask
                          await new Promise(resolve => setTimeout(resolve, 100));
                        } catch (error: any) {
                          if (error?.code === 4001 || error?.code === "ACTION_REJECTED") {
                            console.log(`ℹ️ User cancelled adding Character NFT #${tokenId}`);
                            break; // Stop if user cancels
                          } else if (error?.code === -32002) {
                            console.log(`ℹ️ Request for Character NFT #${tokenId} already pending`);
                          } else if (error?.code === -32603 || error?.message?.includes("already exists")) {
                            console.log(`ℹ️ Character NFT #${tokenId} may already be in wallet`);
                          }
                        }
                      }
                      
                      if (successCount === 0) {
                        setCharacterNftError("No new NFTs found");
                      } else {
                        console.log(`✅ Successfully added ${successCount} Character NFTs to wallet`);
                      }
                    } catch (error: any) {
                      console.log('ℹ️ Character NFT add request completed');
                      setCharacterNftError("No new NFTs found");
                    }
                  }}
                  disabled={!account}
                  className={`font-bold py-2 px-4 rounded-lg text-sm transition-colors w-full ${
                    !account
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  Add Test Character NFT to Metamask
                </button>
                {characterNftError && (
                  <p className="text-red-500 text-xs mt-2">{characterNftError}</p>
                )}
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Claim Founder's Airdrop</h3>
                <p className="text-gray-300 mb-4">
                  Claim your exclusive founder rewards
                </p>
                <button
                  onClick={async () => {
                    if (!account || typeof window.ethereum === "undefined") return;

                    try {
                      console.log("🎁 Attempting to claim founder's airdrop...");

                      // Initialize web3 provider and signer
                      const { ethers } = await import('ethers');
                      const provider = new ethers.BrowserProvider(window.ethereum);
                      const signer = await provider.getSigner();

                      // FAET Token contract address and ABI
                      const FAET_TOKEN_ADDRESS = "0x80fD38fFDE3E77fAcE192Ea74fD510618C50f394";
                      const FAET_TOKEN_ABI = [
                        "function claim(uint256 tokenId)",
                        "function batchClaim(uint256[] calldata tokenIds)",
                        "function isClaimable(uint256 tokenId) view returns (bool)",
                        "function canClaim(address user, uint256 tokenId) view returns (bool)",
                        "function claimed(uint256 tokenId) view returns (bool)",
                        "function balanceOf(address owner) view returns (uint256)",
                        "event PassClaimed(address indexed claimer, uint256 indexed tokenId)"
                      ];

                      // Create contract instance
                      const faetContract = new ethers.Contract(FAET_TOKEN_ADDRESS, FAET_TOKEN_ABI, signer);

                      // Check user's balance before claim
                      const balanceBefore = await faetContract.balanceOf(account);
                      console.log("Balance before claim:", ethers.formatEther(balanceBefore), "FAET");

                      // Try to find claimable tokens (checking first 150 token IDs for Founder's Pass)
                      const claimableTokens = [];
                      for (let tokenId = 0; tokenId < 150; tokenId++) {
                        try {
                          const canClaim = await faetContract.canClaim(account, tokenId);
                          if (canClaim) {
                            claimableTokens.push(tokenId);
                          }
                        } catch (error) {
                          // Skip tokens that can't be checked
                          continue;
                        }
                      }

                      if (claimableTokens.length === 0) {
                        alert("❌ No claimable airdrop tokens found.\n\nYou need to own a Founder's Pass NFT with unclaimed tokens to use this feature.");
                        return;
                      }

                      console.log(`Found ${claimableTokens.length} claimable tokens:`, claimableTokens);

                      // Use batch claim if multiple tokens, single claim if one
                      let tx;
                      if (claimableTokens.length === 1) {
                        console.log(`Claiming single token ID: ${claimableTokens[0]}`);
                        tx = await faetContract.claim(claimableTokens[0]);
                      } else {
                        console.log(`Batch claiming ${claimableTokens.length} tokens`);
                        tx = await faetContract.batchClaim(claimableTokens);
                      }

                      console.log("Transaction submitted:", tx.hash);
                      alert(`🔄 Transaction submitted!\n\nHash: ${tx.hash}\n\nWaiting for confirmation...`);

                      // Wait for transaction confirmation
                      const receipt = await tx.wait();
                      console.log("Transaction confirmed:", receipt);

                      // Check balance after claim
                      const balanceAfter = await faetContract.balanceOf(account);
                      const tokensReceived = balanceAfter - balanceBefore;

                      console.log("Balance after claim:", ethers.formatEther(balanceAfter), "FAET");
                      console.log("Tokens received:", ethers.formatEther(tokensReceived), "FAET");

                      // Show success message
                      alert(`🎉 Airdrop claimed successfully!\n\nTokens claimed: ${claimableTokens.length} Founder's Pass(es)\nFAET received: ${ethers.formatEther(tokensReceived)}\n\nTransaction: ${tx.hash}`);

                    } catch (error: any) {
                      console.error("❌ Error claiming airdrop:", error);

                      if (error?.code === 4001 || error?.code === "ACTION_REJECTED") {
                        console.log('ℹ️ User cancelled airdrop claim transaction');
                      } else if (error?.code === -32002) {
                        alert("⚠️ Transaction request already pending in MetaMask. Please check your wallet.");
                      } else if (error?.reason?.includes("Not claimable") || error?.message?.includes("Not claimable")) {
                        alert("❌ Token not claimable.\n\nThis could mean:\n- You don't own the Founder's Pass NFT\n- The token has already been claimed\n- The token ID is invalid");
                      } else if (error?.reason?.includes("paused") || error?.message?.includes("paused")) {
                        alert("❌ Airdrop claiming is currently paused by the contract administrators.");
                      } else {
                        alert(`❌ Failed to claim airdrop:\n\n${error?.reason || error?.message || "Unknown error occurred"}`);
                      }
                    }
                  }}
                  disabled={!account}
                  className={`font-bold py-2 px-6 rounded-lg transition-colors mb-2 ${
                    !account
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  }`}
                >
                  Claim Airdrop
                </button>
                <button
                  onClick={async () => {
                    setFoundersPassError(""); // Clear previous error
                    
                    if (typeof window.ethereum === "undefined") {
                      console.error("MetaMask not detected");
                      return;
                    }

                    try {
                      console.log("📝 Attempting to add Test Founder's Pass NFTs to MetaMask...");
                      
                      let successCount = 0;
                      let totalAttempts = 0;
                      
                      // Try to add multiple token IDs (1-150) for Founder's Pass
                      for (let tokenId = 1; tokenId <= 150; tokenId++) {
                        try {
                          totalAttempts++;
                          const wasAdded = await window.ethereum.request({
                            method: 'wallet_watchAsset',
                            params: {
                              type: 'ERC721',
                              options: {
                                address: '0x9AcB6e75D9c94eEb9320b35758cF0B21e4FF7a5D',
                                tokenId: tokenId.toString(),
                              },
                            },
                          });

                          if (wasAdded) {
                            successCount++;
                            console.log(`✅ Test Founder's Pass #${tokenId} successfully added to wallet`);
                          }
                          
                          // Small delay between requests to avoid overwhelming MetaMask
                          await new Promise(resolve => setTimeout(resolve, 100));
                        } catch (error: any) {
                          if (error?.code === 4001 || error?.code === "ACTION_REJECTED") {
                            console.log(`ℹ️ User cancelled adding Founder's Pass #${tokenId}`);
                            break; // Stop if user cancels
                          } else if (error?.code === -32002) {
                            console.log(`ℹ️ Request for Founder's Pass #${tokenId} already pending`);
                          } else if (error?.code === -32603 || error?.message?.includes("already exists")) {
                            console.log(`ℹ️ Founder's Pass #${tokenId} may already be in wallet`);
                          }
                        }
                      }
                      
                      if (successCount === 0) {
                        setFoundersPassError("No new NFTs found");
                      } else {
                        console.log(`✅ Successfully added ${successCount} Founder's Pass NFTs to wallet`);
                      }
                    } catch (error: any) {
                      console.log('ℹ️ Founder\'s Pass add request completed');
                      setFoundersPassError("No new NFTs found");
                    }
                  }}
                  disabled={!account}
                  className={`font-bold py-2 px-4 rounded-lg text-sm transition-colors w-full ${
                    !account
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  Add Test Founder's Pass to Metamask
                </button>
                {foundersPassError && (
                  <p className="text-red-500 text-xs mt-2">{foundersPassError}</p>
                )}
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