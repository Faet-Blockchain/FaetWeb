"use client";
import React, { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getContractAddresses } from "../../lib/contracts";
import { getNetworkConfig } from "../../lib/networks";

// Security validation functions

const isValidAddress = (address: string): boolean => {
  // Basic Ethereum address validation
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

const sanitizeError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unknown error occurred";
};

type WalletConnectionProps = {
  account: string | null;
  isConnecting: boolean;
  wrongNetwork: boolean;
  currentChainId: string | null;
  currentChainIdNumber?: number | null;
  selectedNetwork: "testnet" | "mainnet";
  onConnect: () => void;
  onDisconnect: () => void;
  onSwitchNetwork: () => void;
  onGoToStaking: () => void;
  onNetworkChange: (network: "testnet" | "mainnet") => void;
};

// Security: Define validation settings
const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMITS: {
    NFT_ADD_DELAY: 2000, // ms between NFT add requests
    MAX_RETRIES: 3,
    COOLDOWN_PERIOD: 5000, // 5 seconds between major operations
  },
  // Valid ranges
  TOKEN_RANGES: {
    CHARACTER_NFT: { min: 1, max: 10 },
    FOUNDERS_PASS: { min: 1, max: 150 },
  },
  // Expected chain
  LISK_SEPOLIA_CHAIN_ID: "0x106a",
} as const;

// Security: Validate Ethereum address format

// Security: Validate chain ID dynamically based on selected network
const isValidChainId = (
  chainId: string | null,
  selectedNetwork: "testnet" | "mainnet",
  chainIdNumber?: number | null,
): boolean => {
  if (!chainId && !chainIdNumber) return false;

  const networkConfig = getNetworkConfig(selectedNetwork);
  const expectedChainId = networkConfig.chainId;
  const expectedChainNumber = networkConfig.chainIdNumber;

  // Check both hex string and decimal number formats for reliability
  const hexMatches = chainId === expectedChainId;
  const numberMatches = chainIdNumber === expectedChainNumber;

  return hexMatches || numberMatches;
};

// Security: Sanitize error messages to prevent information leakage

const WalletConnection = ({
  account,
  isConnecting,
  wrongNetwork,
  currentChainId,
  currentChainIdNumber,
  selectedNetwork,
  onConnect,
  onDisconnect,
  onSwitchNetwork,
  onGoToStaking,
  onNetworkChange,
}: WalletConnectionProps) => {
  // Get dynamic contract addresses based on selected network
  const contractAddresses = getContractAddresses(selectedNetwork);

  const [characterNftError, setCharacterNftError] = useState<string>("");
  const [foundersPassError, setFoundersPassError] = useState<string>("");
  const [isClaimingAirdrop, setIsClaimingAirdrop] = useState<boolean>(false);
  const [isAddingCharacterNft, setIsAddingCharacterNft] =
    useState<boolean>(false);
  const [isAddingFoundersPass, setIsAddingFoundersPass] =
    useState<boolean>(false);
  const [lastOperationTime, setLastOperationTime] = useState<number>(0);

  // Security: Memoized validation checks with stable network validation
  const securityChecks = useMemo(() => {
    const chainValid = isValidChainId(
      currentChainId,
      selectedNetwork,
      currentChainIdNumber,
    );

    return {
      isValidAccount: account && isValidAddress(account),
      isValidChain: chainValid,
      canPerformOperations: account && chainValid && !wrongNetwork,
    };
  }, [
    account,
    currentChainId,
    currentChainIdNumber,
    wrongNetwork,
    selectedNetwork,
  ]);

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
        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm font-medium">Network:</label>
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => onNetworkChange("mainnet")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedNetwork === "mainnet"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Mainnet
            </button>
            <button
              onClick={() => onNetworkChange("testnet")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedNetwork === "testnet"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Testnet
            </button>
          </div>
        </div>
        <div
          className={`border rounded-lg p-4 ${
            selectedNetwork === "mainnet"
              ? "bg-purple-900 border-purple-600"
              : "bg-blue-900 border-blue-600"
          }`}
        >
          <p
            className={`text-sm ${
              selectedNetwork === "mainnet"
                ? "text-purple-300"
                : "text-blue-300"
            }`}
          >
            {selectedNetwork === "mainnet" ? (
              <>
                🌐 <strong>Mainnet Mode:</strong> You&apos;re using the Lisk
                mainnet. All transactions are real and involve actual tokens.
              </>
            ) : (
              <>
                🧪 <strong>Testnet Mode:</strong> You&apos;re using the Lisk
                Sepolia testnet. Perfect for testing before mainnet launch!
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
        <h2 className="text-2xl font-nocturne-serif-bold mb-6">
          Wallet Connection
        </h2>

        {!account ? (
          <div className="text-center">
            <p className="mb-6 text-gray-300">
              Connect your MetaMask wallet to access staking features
            </p>
            <button
              type="button"
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
                  type="button"
                  onClick={() => {
                    if (!account) {
                      console.log("No account connected");
                      return;
                    }
                    if (!securityChecks.isValidChain) {
                      console.log("Invalid network, switching...");
                      onSwitchNetwork();
                    } else if (
                      securityChecks.isValidAccount &&
                      securityChecks.isValidChain
                    ) {
                      console.log("Network valid, going to staking");
                      onGoToStaking();
                    } else {
                      console.log("Cannot access staking - conditions not met");
                    }
                  }}
                  disabled={!account}
                  className={`font-bold py-2 px-6 rounded-lg transition-colors ${
                    !account
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : !securityChecks.isValidChain
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : securityChecks.isValidAccount &&
                            securityChecks.isValidChain
                          ? selectedNetwork === "mainnet"
                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {!account
                    ? "Connect Wallet First"
                    : !securityChecks.isValidChain
                      ? "Switch Network"
                      : securityChecks.isValidAccount &&
                          securityChecks.isValidChain
                        ? "Go to Staking"
                        : "Network Issue"}
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
                    if (!account) {
                      console.log("No account connected");
                      return;
                    }
                    if (!securityChecks.isValidChain) {
                      console.log("Invalid network, switching...");
                      onSwitchNetwork();
                    } else if (
                      securityChecks.isValidAccount &&
                      securityChecks.isValidChain
                    ) {
                      setCharacterNftError("");

                      // Security: Validate prerequisites
                      if (!validateContractInteraction()) {
                        setCharacterNftError(
                          "Please wait or try again in 2 seconds",
                        );
                        return;
                      }

                      setIsAddingCharacterNft(true);

                      try {
                        console.log(
                          "📝 Attempting to add owned Character NFTs to MetaMask...",
                        );

                        // Initialize web3 provider to check ownership
                        const { ethers } = await import("ethers");

                        if (!window.ethereum) {
                          throw new Error("MetaMask not available");
                        }

                        const provider = new ethers.BrowserProvider(
                          window.ethereum,
                        );
                        const signer = await provider.getSigner();

                        // Character NFT contract setup
                        const characterNftABI = [
                          "function balanceOf(address owner) view returns (uint256)",
                          "function ownerOf(uint256 tokenId) view returns (address)",
                          "function name() view returns (string)",
                          "function symbol() view returns (string)",
                        ];

                        const characterNftContract = new ethers.Contract(
                          contractAddresses.CHARACTER_NFT,
                          characterNftABI,
                          signer,
                        );

                        console.log(
                          `🔍 Connecting to Character NFT contract at: ${contractAddresses.CHARACTER_NFT}`,
                        );

                        // First, verify the contract exists and is accessible
                        try {
                          const contractName =
                            await characterNftContract.name();
                          const contractSymbol =
                            await characterNftContract.symbol();
                          console.log(
                            `✅ Contract verified: ${contractName} (${contractSymbol})`,
                          );
                        } catch (contractError) {
                          console.error(
                            "❌ Contract validation failed:",
                            sanitizeError(contractError),
                          );
                          setCharacterNftError(
                            `Contract not found or invalid at address: ${contractAddresses.CHARACTER_NFT}`,
                          );
                          return;
                        }

                        // Check NFT balance
                        const nftBalance =
                          await characterNftContract.balanceOf(account);
                        console.log(
                          `User owns ${nftBalance.toString()} Character NFTs`,
                        );

                        if (nftBalance === 0n) {
                          setCharacterNftError(
                            "You don't own any Character NFTs",
                          );
                          return;
                        }

                        // Check ownership for each token ID sequentially
                        const ownedTokenIds: number[] = [];

                        console.log("Checking which Character NFTs you own...");

                        for (
                          let tokenId =
                            SECURITY_CONFIG.TOKEN_RANGES.CHARACTER_NFT.min;
                          tokenId <=
                          SECURITY_CONFIG.TOKEN_RANGES.CHARACTER_NFT.max;
                          tokenId++
                        ) {
                          try {
                            const owner =
                              await characterNftContract.ownerOf(tokenId);
                            if (owner.toLowerCase() === account.toLowerCase()) {
                              ownedTokenIds.push(tokenId);
                              console.log(
                                `Found owned Character NFT: #${tokenId}`,
                              );
                            }
                          } catch {
                            // Token doesn't exist or not owned
                          }
                        }

                        if (ownedTokenIds.length === 0) {
                          setCharacterNftError(
                            "No Character NFTs found in your wallet",
                          );
                          return;
                        }

                        console.log(
                          `Adding ${ownedTokenIds.length} Character NFTs to MetaMask...`,
                        );

                        // Add all owned NFTs to MetaMask
                        let successCount = 0;
                        let userCancelled = false;

                        for (const tokenId of ownedTokenIds) {
                          if (userCancelled) break;

                          try {
                            console.log(
                              `Attempting to add Character NFT #${tokenId} to MetaMask...`,
                            );

                            // Add a small delay between requests
                            if (ownedTokenIds.indexOf(tokenId) > 0) {
                              await new Promise((resolve) =>
                                setTimeout(resolve, 1000),
                              );
                            }

                            const params = {
                              type: "ERC721" as const,
                              options: {
                                address: contractAddresses.CHARACTER_NFT,
                                tokenId: tokenId.toString(),
                              },
                            };

                            console.log(
                              `Request params for Character NFT #${tokenId}:`,
                              params,
                            );

                            try {
                              const wasAdded = await (window.ethereum.request as (args: {
                                method: "wallet_watchAsset";
                                params: {
                                  type: "ERC721";
                                  options: {
                                    address: string;
                                    tokenId: string;
                                  };
                                };
                              }) => Promise<boolean>)({
                                method: "wallet_watchAsset",
                                params: params,
                              });

                              if (wasAdded) {
                                successCount++;
                                console.log(
                                  `✅ Added Character NFT #${tokenId} to MetaMask`,
                                );
                              } else {
                                console.log(
                                  `⚠️ MetaMask declined to add Character NFT #${tokenId}`,
                                );
                              }
                            } catch (addError: unknown) {
                              const addErrorObj = addError as {
                                code?: number | string;
                                message?: string;
                                data?: { code?: number; message?: string };
                              };

                              console.error(
                                `Error adding NFT #${tokenId}:`,
                                addError,
                              );

                              // Handle specific MetaMask errors
                              if (addErrorObj?.code === -32603) {
                                console.log(
                                  `⚠️ MetaMask internal error for token #${tokenId} - this is common with ERC721 tokens on some networks`,
                                );
                                // Don't count as failure, just continue
                              } else if (
                                addErrorObj?.code === 4001 ||
                                addErrorObj?.code === "ACTION_REJECTED"
                              ) {
                                console.log("User cancelled Character NFT addition");
                                userCancelled = true;
                                break;
                              } else {
                                console.log(
                                  `Failed to add Character NFT #${tokenId}: ${sanitizeError(addError)}`,
                                );
                              }
                            }
                          } catch (error: unknown) {
                            const errorObj = error as {
                              code?: number | string;
                              message?: string;
                            };

                            console.error(
                              `Error adding Character NFT #${tokenId}:`,
                              error,
                            );

                            if (
                              errorObj?.code === 4001 ||
                              errorObj?.code === "ACTION_REJECTED"
                            ) {
                              console.log(
                                "User cancelled Character NFT addition",
                              );
                              userCancelled = true;
                              break;
                            } else if (errorObj?.code === -32603) {
                              console.log(
                                `Internal RPC error for Character NFT #${tokenId}, continuing with next...`,
                              );
                              // Continue with next token instead of stopping
                            } else {
                              console.log(
                                `Failed to add Character NFT #${tokenId}:`,
                                sanitizeError(error),
                              );
                            }
                          }
                        }

                        if (successCount > 0) {
                          console.log(
                            `✅ Successfully added ${successCount} Character NFT(s) to MetaMask`,
                          );
                          alert(
                            `✅ Successfully added ${successCount} Character NFT(s) to MetaMask!`,
                          );
                        } else if (!userCancelled) {
                          console.log(
                            "⚠️ MetaMask NFT addition not supported or failed",
                          );
                          alert(
                            `ℹ️ MetaMask may not support adding ERC721 tokens on this network. Your NFTs are still safely owned at ${contractAddresses.CHARACTER_NFT}. You can view them on the block explorer.`,
                          );
                        }
                      } catch (error) {
                        console.error("Character NFT addition failed:", error);
                        setCharacterNftError(sanitizeError(error));
                      } finally {
                        setIsAddingCharacterNft(false);
                      }
                    } else {
                      console.log("Cannot add NFT - conditions not met");
                    }
                  }}
                  disabled={!account || isAddingCharacterNft}
                  className={`font-bold py-2 px-4 rounded-lg text-sm transition-colors w-full flex items-center gap-2 justify-center ${
                    !account || isAddingCharacterNft
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : !securityChecks.isValidChain
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {isAddingCharacterNft ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : !securityChecks.isValidChain ? (
                    "Switch Network"
                  ) : selectedNetwork === "mainnet" ? (
                    "Add Character NFT to Metamask"
                  ) : (
                    "Add Test Character NFT to Metamask"
                  )}
                </button>
                {characterNftError && (
                  <p className="text-red-500 text-xs mt-2">
                    {characterNftError}
                  </p>
                )}
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">
                  {selectedNetwork === "mainnet"
                    ? "Claim Founder Airdrop"
                    : "Test Airdrop Claim"}
                </h3>
                <p className="text-gray-300 mb-4">
                  {selectedNetwork === "mainnet"
                    ? "Claim your exclusive founder rewards"
                    : "Test the airdrop claiming functionality"}
                </p>
                <p className="text-yellow-200 text-sm mb-4 text-center">
                  Will claim all unclaimed Founder&apos;s Pass NFTs in your
                  wallet
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={async () => {
                      if (!account) {
                        console.log("No account connected");
                        return;
                      }
                      if (!securityChecks.isValidChain) {
                        console.log("Invalid network, switching...");
                        onSwitchNetwork();
                      } else if (
                        securityChecks.isValidAccount &&
                        securityChecks.isValidChain
                      ) {
                        setFoundersPassError("");

                        // Security: Validate prerequisites
                        if (!validateContractInteraction()) {
                          alert("Please wait or try again in 2 seconds");
                          return;
                        }

                        setIsClaimingAirdrop(true);

                        try {
                          console.log(
                            "🎁 Attempting to claim founder&apos;s airdrop...",
                          );

                          // Security: Validate account format
                          if (!account || !isValidAddress(account)) {
                            throw new Error("Invalid account address");
                          }

                          // Initialize web3 provider with security checks
                          const { ethers } = await import("ethers");

                          // Security: Check if ethereum is available
                          if (typeof window.ethereum === "undefined") {
                            throw new Error("MetaMask not available");
                          }

                          const provider = new ethers.BrowserProvider(
                            window.ethereum,
                          );
                          const signer = await await provider.getSigner();

                          // Security: Validate signer address matches connected account
                          const signerAddress = await signer.getAddress();
                          if (
                            signerAddress.toLowerCase() !==
                            account.toLowerCase()
                          ) {
                            throw new Error("Signer address mismatch");
                          }

                          // FAET Token contract setup with security validation
                          const faetTokenABI = [
                            "function claim(uint256 tokenId)",
                            "function batchClaim(uint256[] calldata tokenIds)",
                            "function canClaim(address user, uint256 tokenId) view returns (bool)",
                            "function claimed(uint256 tokenId) view returns (bool)",
                            "function foundersPassNFT() view returns (address)",
                            "function PASS_COUNT() view returns (uint256)",
                          ];

                          const faetTokenContract = new ethers.Contract(
                            contractAddresses.FAET_TOKEN,
                            faetTokenABI,
                            signer,
                          );

                          // Founder's Pass NFT contract setup
                          const foundersPassABI = [
                            "function balanceOf(address owner) view returns (uint256)",
                            "function ownerOf(uint256 tokenId) view returns (address)",
                            "function totalMinted() view returns (uint256)",
                            "function name() view returns (string)",
                            "function symbol() view returns (string)",
                            "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
                          ];

                          const foundersPassContract = new ethers.Contract(
                            contractAddresses.FOUNDERS_PASS,
                            foundersPassABI,
                            signer,
                          );

                          // Security: Verify contract addresses match
                          const nftAddressFromContract =
                            await faetTokenContract.foundersPassNFT();
                          if (
                            nftAddressFromContract.toLowerCase() !==
                            contractAddresses.FOUNDERS_PASS.toLowerCase()
                          ) {
                            throw new Error("Contract address mismatch");
                          }

                          // Check NFT balance with security validation
                          const nftBalance =
                            await foundersPassContract.balanceOf(account);
                          console.log(
                            `User owns ${nftBalance.toString()} Founder&apos;s Pass NFTs`,
                          );

                          if (nftBalance === 0n) {
                            alert(
                              "❌ No Founder&apos;s Pass NFTs found in your wallet.",
                            );
                            return;
                          }

                          const ownedTokenIds: number[] = [];

                          // Check ownership for each token ID sequentially
                          console.log(
                            "Checking which Founder's Pass NFTs you own...",
                          );

                          for (
                            let tokenId =
                              SECURITY_CONFIG.TOKEN_RANGES.FOUNDERS_PASS.min;
                            tokenId <=
                            SECURITY_CONFIG.TOKEN_RANGES.FOUNDERS_PASS.max;
                            tokenId++
                          ) {
                            try {
                              const owner =
                                await foundersPassContract.ownerOf(tokenId);
                              if (
                                owner.toLowerCase() === account.toLowerCase()
                              ) {
                                ownedTokenIds.push(tokenId);
                                console.log(`Found owned NFT: #${tokenId}`);
                              }
                            } catch {
                              // Token doesn't exist or not owned
                            }
                          }

                          if (ownedTokenIds.length === 0) {
                            alert(
                              "❌ Could not retrieve your Founder&apos;s Pass NFT token IDs. You may not own any NFTs from this collection.",
                            );
                            return;
                          }

                          console.log(
                            `Found ${ownedTokenIds.length} owned token IDs:`,
                            ownedTokenIds,
                          );

                          // Check claimability with rate limiting
                          const claimableTokens: number[] = [];
                          const alreadyClaimedTokens: number[] = [];

                          console.log(
                            `Checking claimability for ${ownedTokenIds.length} tokens...`,
                          );

                          for (const tokenId of ownedTokenIds) {
                            try {
                              // Security: Add delay between contract calls
                              if (ownedTokenIds.indexOf(tokenId) > 0) {
                                await new Promise((resolve) =>
                                  setTimeout(resolve, 100),
                                );
                              }

                              console.log(`Checking token ${tokenId}...`);

                              const isClaimed =
                                await faetTokenContract.claimed(tokenId);
                              if (isClaimed) {
                                console.log(`Token ${tokenId} already claimed`);
                                alreadyClaimedTokens.push(tokenId);
                                continue;
                              }

                              const canClaim = await faetTokenContract.canClaim(
                                account,
                                tokenId,
                              );
                              console.log(
                                `Token ${tokenId} can claim:`,
                                canClaim,
                              );

                              if (canClaim) {
                                claimableTokens.push(tokenId);
                              }
                            } catch (error) {
                              console.log(
                                `Error checking token ${tokenId}:`,
                                sanitizeError(error),
                              );
                            }
                          }

                          console.log(
                            `Found ${claimableTokens.length} claimable tokens:`,
                            claimableTokens,
                          );
                          console.log(
                            `Found ${alreadyClaimedTokens.length} already claimed tokens:`,
                            alreadyClaimedTokens,
                          );

                          if (claimableTokens.length === 0) {
                            if (alreadyClaimedTokens.length > 0) {
                              alert(
                                `❌ All your Founder&apos;s Pass NFTs have already been claimed.`,
                              );
                            } else {
                              alert("❌ No claimable airdrop tokens found.");
                            }
                            return;
                          }

                          // Execute claim with security validation
                          let tx;
                          if (claimableTokens.length === 1) {
                            tx = await faetTokenContract.claim(
                              claimableTokens[0],
                            );
                          } else {
                            // Security: Limit batch size to prevent gas issues
                            const batchSize = Math.min(
                              claimableTokens.length,
                              10,
                            );
                            const tokensToProcess = claimableTokens.slice(
                              0,
                              batchSize,
                            );
                            tx =
                              await faetTokenContract.batchClaim(
                                tokensToProcess,
                              );
                          }

                          alert(`🔄 Transaction submitted! Hash: ${tx.hash}`);

                          // Wait for confirmation with timeout
                          await Promise.race([
                            tx.wait(),
                            new Promise(
                              (_, reject) =>
                                setTimeout(
                                  () =>
                                    reject(new Error("Transaction timeout")),
                                  300000,
                                ), // 5 minutes
                            ),
                          ]);

                          alert(
                            `🎉 Airdrop claimed successfully! Transaction: ${tx.hash}`,
                          );
                        } catch (error: unknown) {
                          // Handle different types of errors gracefully
                          const errorObj = error as {
                            code?: number | string;
                            message?: string;
                            reason?: string;
                          };

                          if (
                            errorObj?.code === 4001 ||
                            errorObj?.code === "ACTION_REJECTED" ||
                            errorObj?.reason === "rejected" ||
                            errorObj?.message?.includes("User denied")
                          ) {
                            console.log(
                              "ℹ️ User cancelled airdrop claim transaction",
                            );
                            // Don't show alert for user cancellation - it's expected behavior
                          } else if (errorObj?.code === -32002) {
                            console.log(
                              "⚠️ Airdrop claim request already pending in MetaMask",
                            );
                            alert(
                              "⚠️ Transaction request already pending in MetaMask. Please check your wallet.",
                            );
                          } else {
                            console.error("Airdrop claim failed:", error);
                            alert(
                              `❌ Airdrop claim failed: ${sanitizeError(error)}`,
                            );
                          }
                        } finally {
                          setIsClaimingAirdrop(false);
                        }
                      } else {
                        console.log(
                          "Cannot claim airdrop - conditions not met",
                        );
                      }
                    }}
                    disabled={!account || isClaimingAirdrop}
                    className={`font-bold py-2 px-6 rounded-lg transition-colors mb-2 flex items-center gap-2 justify-center ${
                      !account || isClaimingAirdrop
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : !securityChecks.isValidChain
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                  >
                    {isClaimingAirdrop ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : !securityChecks.isValidChain ? (
                      "Switch Network"
                    ) : selectedNetwork === "mainnet" ? (
                      "Claim Airdrop"
                    ) : (
                      "Test Claim"
                    )}
                  </button>
                </div>
                <button
                  onClick={async () => {
                    if (!account) {
                      console.log("No account connected");
                      return;
                    }
                    if (!securityChecks.isValidChain) {
                      console.log("Invalid network, switching...");
                      onSwitchNetwork();
                    } else if (
                      securityChecks.isValidAccount &&
                      securityChecks.isValidChain
                    ) {
                      setFoundersPassError("");

                      // Security: Validate prerequisites
                      if (!validateContractInteraction()) {
                        setFoundersPassError(
                          "Please wait or try again in 2 seconds",
                        );
                        return;
                      }

                      setIsAddingFoundersPass(true);

                      try {
                        console.log(
                          "📝 Attempting to add owned Founder's Pass NFTs to MetaMask...",
                        );

                        // Initialize web3 provider to check ownership
                        const { ethers } = await import("ethers");

                        if (!window.ethereum) {
                          throw new Error("MetaMask not available");
                        }

                        const provider = new ethers.BrowserProvider(
                          window.ethereum,
                        );
                        const signer = await provider.getSigner();

                        // Founder's Pass NFT contract setup - ERC721A contract
                        const foundersPassABI = [
                          "function balanceOf(address owner) view returns (uint256)",
                          "function ownerOf(uint256 tokenId) view returns (address)",
                          "function totalMinted() view returns (uint256)",
                          "function name() view returns (string)",
                          "function symbol() view returns (string)",
                          "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
                        ];

                        const foundersPassContract = new ethers.Contract(
                          contractAddresses.FOUNDERS_PASS,
                          foundersPassABI,
                          signer,
                        );

                        console.log(
                          `🔍 Connecting to Founder's Pass contract at: ${contractAddresses.FOUNDERS_PASS}`,
                        );

                        // First, verify the contract exists and is accessible
                        try {
                          const contractName =
                            await foundersPassContract.name();
                          const contractSymbol =
                            await foundersPassContract.symbol();
                          console.log(
                            `✅ Contract verified: ${contractName} (${contractSymbol})`,
                          );
                        } catch (contractError) {
                          console.error(
                            "❌ Contract validation failed:",
                            sanitizeError(contractError),
                          );
                          setFoundersPassError(
                            `Contract not found or invalid at address: ${contractAddresses.FOUNDERS_PASS}`,
                          );
                          return;
                        }

                        // Check NFT balance
                        const nftBalance =
                          await foundersPassContract.balanceOf(account);
                        console.log(
                          `User owns ${nftBalance.toString()} Founder's Pass NFTs`,
                        );

                        if (nftBalance === 0n) {
                          setFoundersPassError(
                            "You don't own any Founder's Pass NFTs",
                          );
                          return;
                        }

                        // Check ownership for each token ID sequentially
                        const ownedTokenIds: number[] = [];

                        console.log(
                          "Checking which Founder's Pass NFTs you own...",
                        );

                        for (
                          let tokenId =
                            SECURITY_CONFIG.TOKEN_RANGES.FOUNDERS_PASS.min;
                          tokenId <=
                          SECURITY_CONFIG.TOKEN_RANGES.FOUNDERS_PASS.max;
                          tokenId++
                        ) {
                          try {
                            const owner =
                              await foundersPassContract.ownerOf(tokenId);
                            if (owner.toLowerCase() === account.toLowerCase()) {
                              ownedTokenIds.push(tokenId);
                              console.log(`Found owned NFT: #${tokenId}`);
                            }
                          } catch {
                            // Token doesn't exist or not owned
                          }
                        }

                        if (ownedTokenIds.length === 0) {
                          setFoundersPassError(
                            "No Founder's Pass NFTs found in your wallet",
                          );
                          return;
                        }

                        console.log(
                          `Adding ${ownedTokenIds.length} NFTs to MetaMask...`,
                        );

                        // Add all owned NFTs to MetaMask with better error handling
                        let successCount = 0;
                        let userCancelled = false;

                        for (const tokenId of ownedTokenIds) {
                          if (userCancelled) break;

                          try {
                            console.log(
                              `Attempting to add Founder's Pass #${tokenId} to MetaMask...`,
                            );

                            // Add a small delay between requests
                            if (ownedTokenIds.indexOf(tokenId) > 0) {
                              await new Promise((resolve) =>
                                setTimeout(resolve, 1000),
                              );
                            }

                            // Validate the request parameters
                            const params = {
                              type: "ERC721" as const,
                              options: {
                                address: contractAddresses.FOUNDERS_PASS,
                                tokenId: tokenId.toString(),
                              },
                            };

                            console.log(
                              `Request params for token #${tokenId}:`,
                              params,
                            );

                            try {
                              const wasAdded = await (window.ethereum.request as (args: {
                                method: "wallet_watchAsset";
                                params: {
                                  type: "ERC721";
                                  options: {
                                    address: string;
                                    tokenId: string;
                                  };
                                };
                              }) => Promise<boolean>)({
                                method: "wallet_watchAsset",
                                params: params,
                              });

                              if (wasAdded) {
                                successCount++;
                                console.log(
                                  `✅ Added Founder's Pass #${tokenId} to MetaMask`,
                                );
                              } else {
                                console.log(
                                  `⚠️ MetaMask declined to add Founder's Pass #${tokenId}`,
                                );
                              }
                            } catch (addError: unknown) {
                              const addErrorObj = addError as {
                                code?: number | string;
                                message?: string;
                                data?: { code?: number; message?: string };
                              };

                              console.error(
                                `Error adding NFT #${tokenId}:`,
                                addError,
                              );

                              // Handle specific MetaMask errors
                              if (addErrorObj?.code === -32603) {
                                console.log(
                                  `⚠️ MetaMask internal error for token #${tokenId} - this is common with ERC721 tokens on some networks`,
                                );
                                // Don't count as failure, just continue
                              } else if (
                                addErrorObj?.code === 4001 ||
                                addErrorObj?.code === "ACTION_REJECTED"
                              ) {
                                console.log("User cancelled NFT addition");
                                userCancelled = true;
                                break;
                              } else {
                                console.log(
                                  `Failed to add NFT #${tokenId}: ${sanitizeError(addError)}`,
                                );
                              }
                            }
                          } catch (error: unknown) {
                            const errorObj = error as {
                              code?: number | string;
                              message?: string;
                              data?: unknown;
                            };

                            console.error(
                              `Error adding NFT #${tokenId}:`,
                              error,
                            );

                            if (
                              errorObj?.code === 4001 ||
                              errorObj?.code === "ACTION_REJECTED"
                            ) {
                              console.log("User cancelled NFT addition");
                              userCancelled = true;
                              break;
                            } else if (errorObj?.code === -32603) {
                              console.log(
                                `Internal RPC error for token #${tokenId}, continuing with next...`,
                              );
                              // Continue with next token instead of stopping
                            } else {
                              console.log(
                                `Failed to add NFT #${tokenId}:`,
                                sanitizeError(error),
                              );
                            }
                          }
                        }

                        if (successCount > 0) {
                          console.log(
                            `✅ Successfully added ${successCount} NFT(s) to MetaMask`,
                          );
                          alert(
                            `✅ Successfully added ${successCount} Founder's Pass NFT(s) to MetaMask!`,
                          );
                        } else if (!userCancelled) {
                          console.log(
                            "⚠️ MetaMask NFT addition not supported or failed",
                          );
                          alert(
                            `ℹ️ MetaMask may not support adding ERC721 tokens on this network. Your NFTs are still safely owned at ${contractAddresses.FOUNDERS_PASS}. You can view them on the block explorer.`,
                          );
                        }
                      } catch (error) {
                        console.error("Founder's Pass addition failed:", error);
                        setFoundersPassError(sanitizeError(error));
                      } finally {
                        setIsAddingFoundersPass(false);
                      }
                    } else {
                      console.log("Cannot add NFT - conditions not met");
                    }
                  }}
                  disabled={!account || isAddingFoundersPass}
                  className={`font-bold py-2 px-4 rounded-lg text-sm transition-colors w-full flex items-center gap-2 justify-center ${
                    !account || isAddingFoundersPass
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : !securityChecks.isValidChain
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {isAddingFoundersPass ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : !securityChecks.isValidChain ? (
                    "Switch Network"
                  ) : selectedNetwork === "mainnet" ? (
                    "Add Founder Pass to Metamask"
                  ) : (
                    "Add Test Founder Pass to Metamask"
                  )}
                </button>
                {foundersPassError && (
                  <p className="text-red-500 text-xs mt-2">
                    {foundersPassError}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
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