"use client";
import React, { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

// Security validation functions

const isValidAddress = (address: string): boolean => {
  // Basic Ethereum address validation
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

const sanitizeError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
};

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

// Security: Define contract addresses and validation
const SECURITY_CONFIG = {
  // Valid contract addresses with checksums
  CONTRACTS: {
    CHARACTER_NFT: '0xB37E9A6Df0887663fe0b4Cc9Ba19F8FC0DE18e12',
    FOUNDERS_PASS: '0x9AcB6e75D9c94eEb9320b35758cF0B21e4FF7a5D',
    FAET_TOKEN: '0x80fD38fFDE3E77fAcE192Ea74fD510618C50f394'
  },
  // Rate limiting
  RATE_LIMITS: {
    NFT_ADD_DELAY: 200, // ms between NFT add requests
    MAX_RETRIES: 3,
    COOLDOWN_PERIOD: 5000 // 5 seconds between major operations
  },
  // Valid ranges
  TOKEN_RANGES: {
    CHARACTER_NFT: { min: 1, max: 10 },
    FOUNDERS_PASS: { min: 1, max: 150 }
  },
  // Expected chain
  LISK_SEPOLIA_CHAIN_ID: '0x106a'
} as const;

// Security: Validate Ethereum address format


// Security: Validate chain ID
const isValidChainId = (chainId: string | null): boolean => {
  return chainId === SECURITY_CONFIG.LISK_SEPOLIA_CHAIN_ID;
};

// Security: Sanitize error messages to prevent information leakage




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
  const [lastOperationTime, setLastOperationTime] = useState<number>(0);

  // Security: Memoized validation checks
  const securityChecks = useMemo(() => ({
    isValidAccount: account && isValidAddress(account),
    isValidChain: isValidChainId(currentChainId),
    canPerformOperations: account && !wrongNetwork && isValidChainId(currentChainId)
  }), [account, currentChainId, wrongNetwork]);

  // Security: Rate limiting check
  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    if (now - lastOperationTime < SECURITY_CONFIG.RATE_LIMITS.COOLDOWN_PERIOD) {
      return false;
    }
    setLastOperationTime(now);
    return true;
  }, [lastOperationTime]);

  // Security: Validate contract interaction prerequisites
  const validateContractInteraction = useCallback((): boolean => {
    if (!securityChecks.canPerformOperations) {
      console.warn("Security: Invalid account or network state");
      return false;
    }

    if (typeof window.ethereum === "undefined") {
      console.warn("Security: MetaMask not detected");
      return false;
    }

    if (!checkRateLimit()) {
      console.warn("Security: Rate limit exceeded");
      return false;
    }

    return true;
  }, [securityChecks.canPerformOperations, checkRateLimit]);
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: "easeInOut", delay: 0.15 }}
        className="mb-8"
      >
      >
        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm font-medium">Network:</label>
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => onNetworkChange('mainnet')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedNetwork === 'mainnet'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
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
        <div className={`border rounded-lg p-4 ${
          selectedNetwork === 'mainnet' 
            ? 'bg-purple-900 border-purple-600' 
            : 'bg-blue-900 border-blue-600'
        }`}>
          <p className={`text-sm ${
            selectedNetwork === 'mainnet' ? 'text-purple-300' : 'text-blue-300'
          }`}>
            {selectedNetwork === 'mainnet' ? (
              <>
                🌐 <strong>Mainnet Mode:</strong> You're using the Lisk mainnet. 
                All transactions are real and involve actual tokens.
              </>
            ) : (
              <>
                🧪 <strong>Testnet Mode:</strong> You're using the Lisk Sepolia testnet. 
                Perfect for testing before mainnet launch!
              </>
            )}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut", delay: 0.2 }}
        className="bg-gray-900 p-8 rounded-lg border border-gray-700 mb-0"
      >
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
                    src="/images/MetaMask-icon-fox.webp"
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
                    !account
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : wrongNetwork
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : canAccessStaking
                      ? selectedNetwork === 'mainnet' 
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {!account 
                    ? "Connect Wallet First"
                    : wrongNetwork 
                    ? "Switch Network" 
                    : canAccessStaking
                    ? "Go to Staking"
                    : "Wrong Network"
                  }
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
                    setCharacterNftError("");

                    // Security: Validate prerequisites
                    if (!validateContractInteraction()) {
                      setCharacterNftError("Invalid wallet state or rate limited");
                      return;
                    }

                    setIsAddingCharacterNft(true);

                    try {
                      console.log("📝 Attempting to add Character NFTs to MetaMask...");

                      let successCount = 0;
                      const { min, max } = SECURITY_CONFIG.TOKEN_RANGES.CHARACTER_NFT;

                      // Security: Validate token range
                      for (let tokenId = min; tokenId <= max; tokenId++) {
                        try {
                          // Security: Validate token ID
                          if (tokenId < min || tokenId > max) {
                            console.warn(`Security: Invalid token ID ${tokenId}`);
                            continue;
                          }

                          // Security: Check if ethereum is still available
                          if (typeof window.ethereum === "undefined") {
                            console.warn(`Security: window.ethereum became unavailable during operation`);
                            break;
                          }

                          const wasAdded = await window.ethereum.request({
                            method: 'wallet_watchAsset',
                            params: {
                              type: 'ERC721',
                              options: {
                                address: SECURITY_CONFIG.CONTRACTS.CHARACTER_NFT,
                                tokenId: tokenId.toString(),
                              },
                            },
                          });

                          if (wasAdded) {
                            successCount++;
                            console.log(`✅ Character NFT #${tokenId} added to wallet`);
                          }

                          // Security: Rate limiting between requests
                          await new Promise(resolve => 
                            setTimeout(resolve, SECURITY_CONFIG.RATE_LIMITS.NFT_ADD_DELAY)
                          );
                        } catch (error: unknown) {
                          const errorObj = error as { code?: number | string; message?: string };
                          if (errorObj?.code === 4001 || errorObj?.code === "ACTION_REJECTED") {
                            console.log(`User cancelled adding Character NFT #${tokenId}`);
                            break; // Stop if user cancels
                          }
                          // Continue with other tokens on other errors
                        }
                      }

                      if (successCount === 0) {
                        setCharacterNftError("No new NFTs were added");
                      }
                    } catch (error) {
                      console.error("Character NFT addition failed:", error);
                      setCharacterNftError(sanitizeError(error));
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
                    {selectedNetwork === 'mainnet' ? "Add Character NFT to Metamask" : "Add Test Character NFT to Metamask"}
                  )}
                </button>
                {characterNftError && (
                  <p className="text-red-500 text-xs mt-2">{characterNftError}</p>
                )}
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">
                  {selectedNetwork === 'mainnet' ? "Claim Founder's Airdrop" : "Test Airdrop Claim"}
                </h3>
                <p className="text-gray-300 mb-4">
                  {selectedNetwork === 'mainnet' 
                    ? "Claim your exclusive founder rewards"
                    : "Test the airdrop claiming functionality"
                  }
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={async () => {
                      // Security: Validate prerequisites
                      if (!validateContractInteraction()) {
                        alert("Invalid wallet state or rate limited. Please check your connection.");
                        return;
                      }

                      setIsClaimingAirdrop(true);

                      try {
                        console.log("🎁 Attempting to claim founder's airdrop...");

                        // Security: Validate account format
                        if (!account || !isValidAddress(account)) {
                          throw new Error("Invalid account address");
                        }

                        // Initialize web3 provider with security checks
                        const { ethers } = await import('ethers');

                        // Security: Check if ethereum is available
                        if (typeof window.ethereum === "undefined") {
                          throw new Error("MetaMask not available");
                        }

                        const provider = new ethers.BrowserProvider(window.ethereum);
                        const signer = await provider.getSigner();

                        // Security: Validate signer address matches connected account
                        const signerAddress = await signer.getAddress();
                        if (signerAddress.toLowerCase() !== account.toLowerCase()) {
                          throw new Error("Signer address mismatch");
                        }

                        // FAET Token contract setup with security validation
                        const faetTokenABI = [
                          "function claim(uint256 tokenId)",
                          "function batchClaim(uint256[] calldata tokenIds)",
                          "function canClaim(address user, uint256 tokenId) view returns (bool)",
                          "function claimed(uint256 tokenId) view returns (bool)",
                          "function foundersPassNFT() view returns (address)",
                          "function PASS_COUNT() view returns (uint256)"
                        ];

                        const faetTokenContract = new ethers.Contract(
                          SECURITY_CONFIG.CONTRACTS.FAET_TOKEN,
                          faetTokenABI,
                          signer
                        );

                        // Founder's Pass NFT contract setup
                        const foundersPassABI = [
                          "function balanceOf(address owner) view returns (uint256)",
                          "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
                          "function ownerOf(uint256 tokenId) view returns (address)"
                        ];

                        const foundersPassContract = new ethers.Contract(
                          SECURITY_CONFIG.CONTRACTS.FOUNDERS_PASS,
                          foundersPassABI,
                          signer
                        );

                        // Security: Verify contract addresses match
                        const nftAddressFromContract = await faetTokenContract.foundersPassNFT();
                        if (nftAddressFromContract.toLowerCase() !== SECURITY_CONFIG.CONTRACTS.FOUNDERS_PASS.toLowerCase()) {
                          throw new Error("Contract address mismatch");
                        }

                        // Check NFT balance with security validation
                        const nftBalance = await foundersPassContract.balanceOf(account);
                        console.log(`User owns ${nftBalance.toString()} Founder's Pass NFTs`);

                        if (nftBalance === 0n) {
                          alert("❌ No Founder's Pass NFTs found in your wallet.");
                          return;
                        }

                        // Security: Limit the number of tokens to check
                        const maxTokensToCheck = Math.min(Number(nftBalance), 150);
                        const ownedTokenIds: number[] = [];

                        // Get owned token IDs with error handling
                        for (let i = 0; i < maxTokensToCheck; i++) {
                          try {
                            const tokenId = await foundersPassContract.tokenOfOwnerByIndex(account, i);
                            const tokenIdNumber = Number(tokenId);

                            // Security: Validate token ID range
                            if (tokenIdNumber >= SECURITY_CONFIG.TOKEN_RANGES.FOUNDERS_PASS.min && 
                                tokenIdNumber <= SECURITY_CONFIG.TOKEN_RANGES.FOUNDERS_PASS.max) {
                              ownedTokenIds.push(tokenIdNumber);
                            }

                            // Add delay between requests to prevent rate limiting
                            if (i < maxTokensToCheck - 1) {
                              await new Promise(resolve => setTimeout(resolve, 50));
                            }
                          } catch (error) {
                            console.log(`Could not get token at index ${i}:`, sanitizeError(error));
                            // If we get an error, try to continue with remaining tokens
                            continue;
                          }
                        }

                        // If we couldn't get tokens using tokenOfOwnerByIndex, try a fallback method
                        if (ownedTokenIds.length === 0) {
                          console.log("Trying fallback method to find owned tokens...");

                          // Fallback: Check ownership of all possible token IDs
                          for (let tokenId = SECURITY_CONFIG.TOKEN_RANGES.FOUNDERS_PASS.min; 
                               tokenId <= SECURITY_CONFIG.TOKEN_RANGES.FOUNDERS_PASS.max; 
                               tokenId++) {
                            try {
                              const owner = await foundersPassContract.ownerOf(tokenId);
                              if (owner.toLowerCase() === account.toLowerCase()) {
                                ownedTokenIds.push(tokenId);
                              }

                              // Rate limiting
                              await new Promise(resolve => setTimeout(resolve, 25));
                            } catch {
                              // Token doesn't exist or other error, continue
                              continue;
                            }
                          }
                        }

                        if (ownedTokenIds.length === 0) {
                          alert("❌ Could not retrieve your Founder's Pass NFT token IDs. You may not own any NFTs from this collection.");
                          return;
                        }

                        console.log(`Found ${ownedTokenIds.length} owned token IDs:`, ownedTokenIds);

                        // Check claimability with rate limiting
                        const claimableTokens: number[] = [];
                        const alreadyClaimedTokens: number[] = [];

                        console.log(`Checking claimability for ${ownedTokenIds.length} tokens...`);

                        for (const tokenId of ownedTokenIds) {
                          try {
                            // Security: Add delay between contract calls
                            if (ownedTokenIds.indexOf(tokenId) > 0) {
                              await new Promise(resolve => setTimeout(resolve, 100));
                            }

                            console.log(`Checking token ${tokenId}...`);

                            const isClaimed = await faetTokenContract.claimed(tokenId);
                            if (isClaimed) {
                              console.log(`Token ${tokenId} already claimed`);
                              alreadyClaimedTokens.push(tokenId);
                              continue;
                            }

                            const canClaim = await faetTokenContract.canClaim(account, tokenId);
                            console.log(`Token ${tokenId} can claim:`, canClaim);

                            if (canClaim) {
                              claimableTokens.push(tokenId);
                            }
                          } catch (error) {
                            console.log(`Error checking token ${tokenId}:`, sanitizeError(error));
                          }
                        }

                        console.log(`Found ${claimableTokens.length} claimable tokens:`, claimableTokens);
                        console.log(`Found ${alreadyClaimedTokens.length} already claimed tokens:`, alreadyClaimedTokens);

                        if (claimableTokens.length === 0) {
                          if (alreadyClaimedTokens.length > 0) {
                            alert(`❌ All your Founder's Pass NFTs have already been claimed.`);
                          } else {
                            alert("❌ No claimable airdrop tokens found.");
                          }
                          return;
                        }

                        // Execute claim with security validation
                        let tx;
                        if (claimableTokens.length === 1) {
                          tx = await faetTokenContract.claim(claimableTokens[0]);
                        } else {
                          // Security: Limit batch size to prevent gas issues
                          const batchSize = Math.min(claimableTokens.length, 10);
                          const tokensToProcess = claimableTokens.slice(0, batchSize);
                          tx = await faetTokenContract.batchClaim(tokensToProcess);
                        }

                        alert(`🔄 Transaction submitted! Hash: ${tx.hash}`);

                        // Wait for confirmation with timeout
                        await Promise.race([
                          tx.wait(),
                          new Promise((_, reject) => 
                            setTimeout(() => reject(new Error("Transaction timeout")), 300000) // 5 minutes
                          )
                        ]);

                        alert(`🎉 Airdrop claimed successfully! Transaction: ${tx.hash}`);

                      } catch (error: unknown) {
                        console.error("Airdrop claim failed:", error);
                        alert(`❌ ${sanitizeError(error)}`);
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
                      {selectedNetwork === 'mainnet' ? "Claim Airdrop" : "Test Claim"}
                    )}
                  </button>
                </div>
                <button
                  onClick={async () => {
                    setFoundersPassError("");

                    // Security: Validate prerequisites
                    if (!validateContractInteraction()) {
                      setFoundersPassError("Invalid wallet state or rate limited");
                      return;
                    }

                    setIsAddingFoundersPass(true);

                    try {
                      console.log("📝 Attempting to add Founder's Pass NFTs to MetaMask...");

                      let successCount = 0;
                      const { min, max } = SECURITY_CONFIG.TOKEN_RANGES.FOUNDERS_PASS;

                      // Security: Validate and process tokens in batches
                      for (let tokenId = min; tokenId <= max; tokenId++) {
                        try {
                          // Security: Validate token ID
                          if (tokenId < min || tokenId > max) {
                            console.warn(`Security: Invalid token ID ${tokenId}`);
                            continue;
                          }

                          // Security: Check if ethereum is still available
                          if (typeof window.ethereum === "undefined") {
                            console.warn(`Security: window.ethereum became unavailable during operation`);
                            break;
                          }

                          const wasAdded = await window.ethereum.request({
                            method: 'wallet_watchAsset',
                            params: {
                              type: 'ERC721',
                              options: {
                                address: SECURITY_CONFIG.CONTRACTS.FOUNDERS_PASS,
                                tokenId: tokenId.toString(),
                              },
                            },
                          });

                          if (wasAdded) {
                            successCount++;
                            console.log(`✅ Founder's Pass #${tokenId} added to wallet`);
                          }

                          // Security: Rate limiting between requests
                          await new Promise(resolve => 
                            setTimeout(resolve, SECURITY_CONFIG.RATE_LIMITS.NFT_ADD_DELAY)
                          );
                        } catch (error: unknown) {
                          const errorObj = error as { code?: number | string; message?: string };
                          if (errorObj?.code === 4001 || errorObj?.code === "ACTION_REJECTED") {
                            console.log(`User cancelled adding Founder's Pass #${tokenId}`);
                            break; // Stop if user cancels
                          }
                          console.log(`Error adding Founder's Pass #${tokenId}:`, sanitizeError(error));
                          // Continue with other tokens on other errors
                        }
                      }

                      if (successCount === 0) {
                        setFoundersPassError("No new NFTs were added");
                      }
                    } catch (error) {
                      console.error("Founder's Pass addition failed:", error);
                      setFoundersPassError(sanitizeError(error));
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
                    {selectedNetwork === 'mainnet' ? "Add Founder's Pass to Metamask" : "Add Test Founder's Pass to Metamask"}
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