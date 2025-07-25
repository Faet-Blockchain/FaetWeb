"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

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
  const [isClaimingAirdrop, setIsClaimingAirdrop] = useState<boolean>(false);
  const [isAddingCharacterNft, setIsAddingCharacterNft] = useState<boolean>(false);
  const [isAddingFoundersPass, setIsAddingFoundersPass] = useState<boolean>(false);
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
                  <Image
                    src="/images/metamask-icon.png"
                    alt="MetaMask"
                    width={24}
                    height={24}
                    className="w-6 h-6"
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
                    setIsAddingCharacterNft(true);

                    if (typeof window.ethereum === "undefined") {
                      console.error("MetaMask not detected");
                      setIsAddingCharacterNft(false);
                      return;
                    }

                    try {
                      console.log("📝 Attempting to add Test Character NFTs to MetaMask...");

                      let successCount = 0;
                      // let totalAttempts = 0;

                      // Try to add multiple token IDs (1-10) for Character NFTs
                      for (let tokenId = 1; tokenId <= 10; tokenId++) {
                        try {
                          // totalAttempts++;
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
                        } catch (error: unknown) {
                          if ((error as { code?: number | string })?.code === 4001 || (error as { code?: number | string })?.code === "ACTION_REJECTED") {
                            console.log(`ℹ️ User cancelled adding Character NFT #${tokenId}`);
                            break; // Stop if user cancels
                          } else if ((error as { code?: number })?.code === -32002) {
                            console.log(`ℹ️ Request for Character NFT #${tokenId} already pending`);
                          } else if ((error as { code?: number; message?: string })?.code === -32603 || (error as { message?: string })?.message?.includes("already exists")) {
                            console.log(`ℹ️ Character NFT #${tokenId} may already be in wallet`);
                          }
                        }
                      }

                      if (successCount === 0) {
                        setCharacterNftError("No new NFTs found");
                      } else {
                        console.log(`✅ Successfully added ${successCount} Character NFTs to wallet`);
                      }
                    } catch {
                      console.log('ℹ️ Character NFT add request completed');
                      setCharacterNftError("No new NFTs found");
                    } finally {
                      setIsAddingCharacterNft(false);
                    }
                  }}
                  disabled={!account || isAddingCharacterNft}
                  className={`font-bold py-2 px-4 rounded-lg text-sm transition-colors w-full flex items-center gap-2 justify-center ${
                    !account || isAddingCharacterNft
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {isAddingCharacterNft ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    "Add Test Character NFT to Metamask"
                  )}
                </button>
                {characterNftError && (
                  <p className="text-red-500 text-xs mt-2">{characterNftError}</p>
                )}
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Claim Founder&apos;s Airdrop</h3>
                <p className="text-gray-300 mb-4">
                  Claim your exclusive founder rewards
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={async () => {
                      if (!account || typeof window.ethereum === "undefined") return;

                      setIsClaimingAirdrop(true);

                      try {
                        console.log("🎁 Attempting to claim founder's airdrop...");

                        // Initialize web3 provider and signer
                        const { ethers } = await import('ethers');
                        const provider = new ethers.BrowserProvider(window.ethereum);
                        const signer = await provider.getSigner();

                        // FAET Token contract setup (where the claim functions are)
                        const faetTokenABI = [
                          "function claim(uint256 tokenId)",
                          "function batchClaim(uint256[] calldata tokenIds)",
                          "function canClaim(address user, uint256 tokenId) view returns (bool)",
                          "function isClaimable(uint256 tokenId) view returns (bool)",
                          "function claimed(uint256 tokenId) view returns (bool)",
                          "function foundersPassNFT() view returns (address)",
                          "function PASS_COUNT() view returns (uint256)"
                        ];

                        const faetTokenContract = new ethers.Contract(
                          "0x80fD38fFDE3E77fAcE192Ea74fD510618C50f394", // FAET Token contract
                          faetTokenABI,
                          signer
                        );

                        // Founder's Pass NFT contract setup (to check ownership)
                        const foundersPassABI = [
                          "function balanceOf(address owner) view returns (uint256)",
                          "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
                          "function ownerOf(uint256 tokenId) view returns (address)"
                        ];

                        const foundersPassContract = new ethers.Contract(
                          "0x9AcB6e75D9c94eEb9320b35758cF0B21e4FF7a5D", // Founder's Pass NFT contract
                          foundersPassABI,
                          signer
                        );

                        console.log("📋 Checking Founder's Pass NFT balance...");

                        // Verify the contracts are connected properly
                        const nftAddressFromContract = await faetTokenContract.foundersPassNFT();
                        console.log("NFT address from FAET contract:", nftAddressFromContract);
                        console.log("Expected NFT address:", "0x9AcB6e75D9c94eEb9320b35758cF0B21e4FF7a5D");

                        // Check if user owns any Founder's Pass NFTs
                        const nftBalance = await foundersPassContract.balanceOf(account);
                        console.log(`User owns ${nftBalance.toString()} Founder's Pass NFTs`);

                        if (nftBalance === 0n) {
                          alert("❌ No Founder's Pass NFTs found in your wallet.\n\nYou need to own at least one Founder's Pass NFT to claim the airdrop.");
                          return;
                        }

                        // Get all token IDs owned by user using tokenOfOwnerByIndex
                        const ownedTokenIds = [];
                        for (let i = 0; i < Number(nftBalance); i++) {
                          try {
                            const tokenId = await foundersPassContract.tokenOfOwnerByIndex(account, i);
                            ownedTokenIds.push(Number(tokenId));
                            console.log(`Found owned token ID: ${tokenId}`);
                          } catch (error) {
                            console.log(`Could not get token at index ${i}:`, error);
                            // If tokenOfOwnerByIndex fails, try alternative method
                            // Check tokens 0-149 individually
                            const passCount = await faetTokenContract.PASS_COUNT();
                            for (let tokenId = 0; tokenId < Number(passCount); tokenId++) {
                              try {
                                const owner = await foundersPassContract.ownerOf(tokenId);
                                if (owner.toLowerCase() === account.toLowerCase()) {
                                  ownedTokenIds.push(tokenId);
                                  console.log(`Found owned token ID via direct check: ${tokenId}`);
                                }
                              } catch {
                                // Token doesn't exist or other error, continue
                              }
                            }
                            break; // Exit the tokenOfOwnerByIndex loop since it's not working
                          }
                        }

                        console.log("All owned Founder's Pass token IDs:", ownedTokenIds);

                        if (ownedTokenIds.length === 0) {
                          alert("❌ Could not retrieve your Founder's Pass NFT token IDs.\n\nPlease try again or contact support.");
                          return;
                        }

                        // Check which of the owned tokens are claimable
                        const claimableTokens = [];
                        const alreadyClaimedTokens = [];

                        for (const tokenId of ownedTokenIds) {
                          try {
                            // Check if already claimed
                            const isClaimed = await faetTokenContract.claimed(tokenId);
                            if (isClaimed) {
                              alreadyClaimedTokens.push(tokenId);
                              continue;
                            }

                            // Check if claimable
                            const canClaim = await faetTokenContract.canClaim(account, tokenId);
                            console.log(`Token ${tokenId}: canClaim = ${canClaim}, claimed = ${isClaimed}`);

                            if (canClaim) {
                              claimableTokens.push(tokenId);
                            }
                          } catch (error) {
                            console.log(`Error checking claimability for token ${tokenId}:`, error);
                          }
                        }

                        console.log(`Claimable tokens: ${claimableTokens}`);
                        console.log(`Already claimed tokens: ${alreadyClaimedTokens}`);

                        if (claimableTokens.length === 0) {
                          if (alreadyClaimedTokens.length > 0) {
                            alert(`❌ All your Founder's Pass NFTs have already been claimed.\n\nAlready claimed token IDs: ${alreadyClaimedTokens.join(', ')}`);
                          } else {
                            alert("❌ No claimable airdrop tokens found.\n\nThis could mean:\n- The tokens have already been claimed\n- There's an issue with the contract\n- The claiming period has ended");
                          }
                          return;
                        }

                        // Use batch claim if multiple tokens, single claim if one
                        let tx;
                        if (claimableTokens.length === 1) {
                          console.log(`Claiming single token ID: ${claimableTokens[0]}`);
                          tx = await faetTokenContract.claim(claimableTokens[0]);
                        } else {
                          console.log(`Batch claiming ${claimableTokens.length} tokens:`, claimableTokens);
                          tx = await faetTokenContract.batchClaim(claimableTokens);
                        }

                        console.log("Transaction submitted:", tx.hash);
                        alert(`🔄 Transaction submitted!\n\nHash: ${tx.hash}\n\nClaiming ${claimableTokens.length} Founder's Pass token(s)\nWaiting for confirmation...`);

                        // Wait for transaction confirmation
                        const receipt = await tx.wait();
                        console.log("Transaction confirmed:", receipt);

                        // Show success message
                        alert(`🎉 Airdrop claimed successfully!\n\nFounder's Pass tokens claimed: ${claimableTokens.length}\nToken IDs: ${claimableTokens.join(', ')}\nTransaction: ${tx.hash}`);

                      } catch (error: unknown) {
                          if ((error as { code?: number | string })?.code === 4001 || (error as { code?: number | string })?.code === "ACTION_REJECTED") {
                            console.log('ℹ️ User cancelled airdrop claim transaction');
                            alert("ℹ️ Transaction cancelled by user.");
                          } else if ((error as { code?: number })?.code === -32002) {
                            alert("⚠️ Transaction request already pending in MetaMask. Please check your wallet.");
                          } else if ((error as { reason?: string; message?: string })?.reason?.includes("Not claimable") || (error as { message?: string })?.message?.includes("Not claimable") || (error as { message?: string })?.message?.includes("FAET: Not claimable")) {
                            alert("❌ Token not claimable.\n\nThis could mean:\n- You don't own the Founder's Pass NFT\n- The token has already been claimed\n- The token ID is invalid\n- The contract is paused");
                          } else if ((error as { reason?: string; message?: string })?.reason?.includes("paused") || (error as { message?: string })?.message?.includes("paused")) {
                            alert("❌ Airdrop claiming is currently paused by the contract administrators.");
                          } else if ((error as { message?: string })?.message?.includes("insufficient funds")) {
                            alert("❌ Insufficient funds for gas fees. Please add more ETH to your wallet.");
                          } else if ((error as { code?: number })?.code === -32603) {
                            alert("❌ Internal JSON-RPC error. This might be a network issue. Please try again.");
                          } else {
                            const errorMsg = (error as { reason?: string; message?: string })?.reason || (error as { message?: string })?.message || "Unknown error occurred";
                            alert(`❌ Failed to claim airdrop:\n\n${errorMsg}\n\nPlease check the console for more details.`);
                          }
                        } finally {
                        setIsClaimingAirdrop(false);
                      }
                    }}
                    disabled={!account || isClaimingAirdrop}
                    className={`font-bold py-2 px-6 rounded-lg transition-colors mb-2 flex items-center gap-2 justify-center ${
                      !account || isClaimingAirdrop
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                  >
                    {isClaimingAirdrop ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      "Claim Airdrop"
                    )}
                  </button>
                </div>
                <button
                  onClick={async () => {
                    setFoundersPassError(""); // Clear previous error
                    setIsAddingFoundersPass(true);

                    if (typeof window.ethereum === "undefined") {
                      console.error("MetaMask not detected");
                      setIsAddingFoundersPass(false);
                      return;
                    }

                    try {
                      console.log("📝 Attempting to add Test Founder's Pass NFTs to MetaMask...");

                      let successCount = 0;
                      // let totalAttempts = 0;

                      // Try to add multiple token IDs (1-150) for Founder's Pass
                      for (let tokenId = 1; tokenId <= 150; tokenId++) {
                        try {
                          // totalAttempts++;
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
                        } catch (error: unknown) {
                          if ((error as { code?: number | string })?.code === 4001 || (error as { code?: number | string })?.code === "ACTION_REJECTED") {
                            console.log(`ℹ️ User cancelled adding Founder's Pass #${tokenId}`);
                            break; // Stop if user cancels
                          } else if ((error as { code?: number })?.code === -32002) {
                            console.log(`ℹ️ Request for Founder's Pass #${tokenId} already pending`);
                          } else if ((error as { code?: number; message?: string })?.code === -32603 || (error as { message?: string })?.message?.includes("already exists")) {
                            console.log(`ℹ️ Founder's Pass #${tokenId} may already be in wallet`);
                          }
                        }
                      }

                      if (successCount === 0) {
                        setFoundersPassError("No new NFTs found");
                      } else {
                        console.log(`✅ Successfully added ${successCount} Founder's Pass NFTs to wallet`);
                      }
                    } catch {
                      console.log('ℹ️ Founder\'s Pass add request completed');
                      setFoundersPassError("No new NFTs found");
                    } finally {
                      setIsAddingFoundersPass(false);
                    }
                  }}
                  disabled={!account || isAddingFoundersPass}
                  className={`font-bold py-2 px-4 rounded-lg text-sm transition-colors w-full flex items-center gap-2 justify-center ${
                    !account || isAddingFoundersPass
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {isAddingFoundersPass ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    "Add Test Founder's Pass to Metamask"
                  )}
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