"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";
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
  if (typeof error === "object" && error !== null) {
    const errorObj = error as Record<string, unknown>;
    if (errorObj.message && typeof errorObj.message === "string") {
      return errorObj.message;
    }
    if (errorObj.reason && typeof errorObj.reason === "string") {
      return errorObj.reason;
    }
    // If it's an empty object or no useful properties, return a generic message
    if (Object.keys(errorObj).length === 0) {
      return "MetaMask operation failed";
    }
    return JSON.stringify(error);
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

const getMetaMaskProvider = () => {
  const eth = typeof window !== "undefined" ? window.ethereum : undefined;
  if (!eth) return null;
  return Array.isArray(eth.providers)
    ? eth.providers.find((p) => p.isMetaMask)
    : eth.isMetaMask
      ? eth
      : null;
};

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
  // State setters that are assumed to be passed down or managed elsewhere
  // For this component to function, these would typically be managed by a parent component or a context.
  // We'll define placeholder setters here for the component to compile, assuming they exist.
  const [internalAccount, setAccount] = useState<string | null>(account);
  const [internalWrongNetwork, setWrongNetwork] = useState<boolean>(wrongNetwork);
  const [internalCurrentChainId, setCurrentChainId] = useState<string | null>(currentChainId);
  // If currentChainIdNumber is also managed internally, it would be here.
  // For now, we'll use the prop directly where needed and assume state management is external if not explicitly set.

  // Placeholder for any state clearing logic from the parent/context
  const clearWeb3State = useCallback(() => {
    // Clear internal state immediately to prevent loops
    setAccount(null);
    setCurrentChainId(null);
    setWrongNetwork(false);
    console.log("Web3 state cleared");
  }, []);


  // Get dynamic contract addresses based on selected network
  const contractAddresses = getContractAddresses(selectedNetwork);

  const [isClaimingAirdrop, setIsClaimingAirdrop] = useState<boolean>(false);
  const [isAddingCharacterNFTs, setIsAddingCharacterNFTs] = useState<boolean>(false);
  const [isAddingFoundersPass, setIsAddingFoundersPass] = useState<boolean>(false);
  const [lastOperationTime, setLastOperationTime] = useState<number>(0);

  // Security: Memoized validation checks with stable network validation
  const securityChecks = useMemo(() => {
    const chainValid = isValidChainId(
      internalCurrentChainId, // Use internal state for consistency
      selectedNetwork,
      currentChainIdNumber,
    );

    return {
      isValidAccount: internalAccount && isValidAddress(internalAccount), // Use internal state
      isValidChain: chainValid,
      canPerformOperations: internalAccount && chainValid && !internalWrongNetwork, // Use internal state
    };
  }, [
    internalAccount, // Use internal state
    internalCurrentChainId, // Use internal state
    currentChainIdNumber,
    internalWrongNetwork, // Use internal state
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

    const eth = typeof window !== "undefined" ? window.ethereum : undefined;
    if (!eth) {
      console.warn("Security: MetaMask not detected");
      return false;
    }

    if (!checkRateLimit()) {
      console.warn("Security: Rate limit exceeded");
      return false;
    }

    return true;
  }, [securityChecks.canPerformOperations, checkRateLimit]);

  // Helper function to get ethereum provider
  const getEth = () =>
    (typeof window !== "undefined" ? window.ethereum : undefined) ?? null;

  // Create stable listener functions that we can reference for cleanup
  const handleAccountsChanged = useCallback((...args: unknown[]) => {
    const accounts = args[0] as string[];
    console.log("Accounts changed:", accounts);
    
    if (accounts.length === 0) {
      // User disconnected from MetaMask - clear state once
      console.log("No accounts, clearing state");
      clearWeb3State();
      onDisconnect(); // Call the prop to inform parent
    } else if (accounts[0] !== internalAccount) {
      // Only update if account actually changed
      console.log("Account changed to:", accounts[0]);
      setAccount(accounts[0]);
      
      // Update chain info if available
      const eth = getEth();
      if (eth?.chainId && eth.chainId !== internalCurrentChainId) {
        setCurrentChainId(eth.chainId);
        const networkConfig = getNetworkConfig(selectedNetwork);
        setWrongNetwork(eth.chainId !== networkConfig.chainId);
      }
    }
  }, [internalAccount, internalCurrentChainId, selectedNetwork, clearWeb3State, onDisconnect]);

  const handleChainChanged = useCallback((...args: unknown[]) => {
    const newChainId = args[0] as string;
    console.log("Chain changed to:", newChainId);
    
    // Only update if chain actually changed
    if (newChainId !== internalCurrentChainId) {
      setCurrentChainId(newChainId);
      const networkConfig = getNetworkConfig(selectedNetwork);
      const isWrong = newChainId !== networkConfig.chainId;
      setWrongNetwork(isWrong);
      
      if (isWrong) {
        console.log("Wrong network detected, may need to switch");
      }
    }
  }, [internalCurrentChainId, selectedNetwork]);

  const handleDisconnect = useCallback(() => {
    console.log("Disconnect event received");
    clearWeb3State();
    onDisconnect(); // Call the prop to inform parent
  }, [clearWeb3State, onDisconnect]);


  // Effect to handle MetaMask event listeners on mount and cleanup on unmount
  useEffect(() => {
    const eth = getEth();
    let isActive = true; // Flag to prevent state updates after cleanup

    if (eth) {
      console.log("Setting up MetaMask event listeners");
      
      // Add listeners
      eth.on("accountsChanged", handleAccountsChanged);
      eth.on("chainChanged", handleChainChanged);
      eth.on("disconnect", handleDisconnect);

      // Initial check for already connected account
      const checkInitialConnection = async () => {
        if (!isActive) return; // Prevent updates if component unmounted
        
        try {
          const accounts = await eth.request({ method: "eth_accounts" });
          if (!isActive) return; // Check again after async operation
          
          if (accounts && accounts.length > 0) {
            console.log("Initial account found:", accounts[0]);
            setAccount(accounts[0]);
            if (eth.chainId) {
              setCurrentChainId(eth.chainId);
              const networkConfig = getNetworkConfig(selectedNetwork);
              setWrongNetwork(eth.chainId !== networkConfig.chainId);
            }
          } else {
            console.log("No initial accounts found");
            clearWeb3State();
          }
        } catch (error) {
          if (isActive) {
            console.error("Error during initial connection check:", error);
            clearWeb3State();
          }
        }
      };
      
      checkInitialConnection();

      // Cleanup listeners on component unmount
      return () => {
        isActive = false; // Prevent any pending state updates
        console.log("Cleaning up MetaMask event listeners");
        
        if (eth.removeListener) {
          try {
            eth.removeListener("accountsChanged", handleAccountsChanged);
            eth.removeListener("chainChanged", handleChainChanged);
            eth.removeListener("disconnect", handleDisconnect);
            console.log("Event listeners removed successfully");
          } catch (error) {
            console.warn("Failed to remove some event listeners on unmount:", error);
          }
        }
      };
    } else {
      console.log("No Ethereum provider found");
      if (isActive) {
        clearWeb3State();
      }
    }
  }, [selectedNetwork, clearWeb3State, handleAccountsChanged, handleChainChanged, handleDisconnect]); // Include all dependencies


  // Enhanced disconnect function with proper cleanup
  const disconnectWallet = useCallback(() => {
    const eth = getEth();

    // 1) Remove event listeners using the same function references
    if (eth?.removeListener) {
      try {
        eth.removeListener("accountsChanged", handleAccountsChanged);
        eth.removeListener("chainChanged", handleChainChanged);
        eth.removeListener("disconnect", handleDisconnect);
      } catch (error) {
        console.warn("Failed to remove some event listeners:", error);
      }
    }

    // 2) Try to revoke eth_accounts permission (wallet may ignore)
    if (eth?.request) {
      eth.request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      }).catch(() => {
        // Ignore if unsupported - many wallets don't support this yet
      });
    }

    // 3) Clear app state
    setAccount(null);
    setWrongNetwork(false);
    setCurrentChainId(null);
    clearWeb3State();

    // 4) Clear any autoconnect markers in localStorage
    try {
      localStorage.removeItem("faet:lastConnectedWallet");
      localStorage.removeItem("faet:autoConnect");
    } catch {
      // Ignore localStorage errors
    }

    // 5) Verify disconnection (for debugging)
    if (eth?.request) {
      eth.request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts?.length > 0) {
            console.warn("Still authorized in MetaMask; user must manually disconnect in wallet settings.");
          } else {
            console.log("Successfully disconnected from MetaMask");
          }
        })
        .catch(() => {
          // Ignore errors in verification
        });
    }
    // Call the prop to inform parent component about disconnection
    onDisconnect();
  }, [clearWeb3State, handleAccountsChanged, handleChainChanged, handleDisconnect, onDisconnect]);


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

        {!internalAccount ? ( // Use internalAccount state
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
                {internalAccount} {/* Use internalAccount state */}
              </p>
              {internalCurrentChainId && ( // Use internal state
                <p className="text-gray-300 text-xs mt-2">
                  Chain ID: {internalCurrentChainId} {/* Use internal state */}
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
                    if (!internalAccount) { // Use internalAccount state
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
                  disabled={!internalAccount} // Use internalAccount state
                  className={`font-bold py-2 px-6 rounded-lg transition-colors ${
                    !internalAccount // Use internalAccount state
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
                  {!internalAccount // Use internalAccount state
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
                <div className="space-y-3">
                  <button
                    disabled={true}
                    className="w-full bg-gray-600 text-gray-400 cursor-not-allowed font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Coming Soon
                  </button>

                  <div className="border-t border-gray-600 pt-3 space-y-2">
                    <p className="text-xs text-gray-400 text-center mb-2">Add NFTs to Wallet:</p>
                    <button
                      onClick={async () => {
                        if (!internalAccount) { // Use internalAccount state
                          console.log("No account connected");
                          return;
                        }
                        if (!securityChecks.isValidChain) {
                          console.log("Invalid network, switching...");
                          onSwitchNetwork();
                          return;
                        }

                        if (!validateContractInteraction()) {
                          alert("Please wait or try again in 2 seconds");
                          return;
                        }

                        setIsAddingCharacterNFTs(true);

                        try {
                          const metaMask = getMetaMaskProvider();
                          if (!metaMask) {
                            console.error("MetaMask not detected");
                            return;
                          }

                          // Initialize web3 to check which NFTs the user owns
                          const { ethers } = await import("ethers");

                          const eth = typeof window !== "undefined" ? window.ethereum : undefined;
                          if (!eth) {
                            throw new Error("MetaMask provider not found");
                          }

                          const provider = new ethers.BrowserProvider(eth);

                          // Character NFT contract setup
                          const characterNftABI = [
                            "function balanceOf(address owner) view returns (uint256)",
                            "function ownerOf(uint256 tokenId) view returns (address)",
                            "function totalSupply() view returns (uint256)",
                          ];

                          const characterNftContract = new ethers.Contract(
                            contractAddresses.CHARACTER_NFT,
                            characterNftABI,
                            provider,
                          );

                          // Check NFT balance
                          const nftBalance = await characterNftContract.balanceOf(internalAccount); // Use internalAccount state

                          if (nftBalance === 0n) {
                            alert("❌ You don't own any Character NFTs");
                            return;
                          }

                          // Find all NFTs the user owns
                          const ownedTokenIds: number[] = [];

                          // Check token IDs in the expected range
                          for (let tokenId = 1; tokenId <= 10; tokenId++) {
                            try {
                              const owner = await characterNftContract.ownerOf(tokenId);
                              if (owner.toLowerCase() === internalAccount.toLowerCase()) { // Use internalAccount state
                                ownedTokenIds.push(tokenId);
                              }
                            } catch {
                              // Token doesn't exist or not owned, continue
                            }
                          }

                          if (ownedTokenIds.length === 0) {
                            alert("❌ Could not find owned Character NFT token IDs");
                            return;
                          }

                          console.log(`Found ${ownedTokenIds.length} owned Character NFTs:`, ownedTokenIds);

                          // Add each NFT to MetaMask one by one
                          let successCount = 0;
                          let errorCount = 0;

                          for (const tokenId of ownedTokenIds) {
                            try {
                              await metaMask.request({
                                method: "wallet_watchAsset",
                                params: {
                                  type: "ERC721",
                                  options: {
                                    address: contractAddresses.CHARACTER_NFT,
                                    tokenId: tokenId.toString(),
                                  },
                                },
                              });
                              successCount++;

                              // Add delay between requests to avoid rate limiting
                              if (tokenId !== ownedTokenIds[ownedTokenIds.length - 1]) {
                                await new Promise(resolve => setTimeout(resolve, 1000));
                              }
                            } catch (nftError: unknown) {
                              const error = nftError as { code?: number };
                              if (error?.code === 4001) {
                                console.log(`User rejected adding Character NFT #${tokenId}`);
                                break; // Stop if user rejects
                              } else {
                                console.error(`Failed to add Character NFT #${tokenId}:`, nftError);
                                errorCount++;
                              }
                            }
                          }

                          if (successCount > 0) {
                            alert(`✅ Successfully added ${successCount} Character NFT${successCount > 1 ? 's' : ''} to your wallet!`);
                          }
                          if (errorCount > 0) {
                            alert(`⚠️ Failed to add ${errorCount} Character NFT${errorCount > 1 ? 's' : ''}`);
                          }

                        } catch (err: unknown) {
                          const error = err as { code?: number };
                          if (error?.code === 4001) {
                            console.log("User rejected the add NFT request.");
                          } else {
                            console.error("Add Character NFTs failed", err);
                            alert(`❌ Failed to add Character NFTs: ${sanitizeError(err)}`);
                          }
                        } finally {
                          setIsAddingCharacterNFTs(false);
                        }
                      }}
                      disabled={!internalAccount || isAddingCharacterNFTs} // Use internalAccount state
                      className={`w-full font-bold py-1 px-3 text-xs rounded transition-colors flex items-center justify-center gap-1 ${
                        !internalAccount || isAddingCharacterNFTs // Use internalAccount state
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : !securityChecks.isValidChain
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : selectedNetwork === "mainnet"
                              ? "bg-purple-600 hover:bg-purple-700 text-white"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {isAddingCharacterNFTs ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : !internalAccount ? ( // Use internalAccount state
                        "Connect Wallet First"
                      ) : !securityChecks.isValidChain ? (
                        "Switch Network"
                      ) : (
                        "Add Character NFTs to MetaMask"
                      )}
                    </button>

                    <button
                      onClick={async () => {
                        if (!internalAccount) { // Use internalAccount state
                          console.log("No account connected");
                          return;
                        }
                        if (!securityChecks.isValidChain) {
                          console.log("Invalid network, switching...");
                          onSwitchNetwork();
                          return;
                        }

                        if (!validateContractInteraction()) {
                          alert("Please wait or try again in 2 seconds");
                          return;
                        }

                        setIsAddingFoundersPass(true);

                        try {
                          const metaMask = getMetaMaskProvider();
                          if (!metaMask) {
                            console.error("MetaMask not detected");
                            return;
                          }

                          // Initialize web3 to check which NFTs the user owns
                          const { ethers } = await import("ethers");

                          const eth = typeof window !== "undefined" ? window.ethereum : undefined;
                          if (!eth) {
                            throw new Error("MetaMask provider not found");
                          }

                          const provider = new ethers.BrowserProvider(eth);


                          // Founder's Pass NFT contract setup
                          const foundersPassABI = [
                            "function balanceOf(address owner) view returns (uint256)",
                            "function ownerOf(uint256 tokenId) view returns (address)",
                            "function totalSupply() view returns (uint256)",
                          ];

                          const foundersPassContract = new ethers.Contract(
                            contractAddresses.FOUNDERS_PASS,
                            foundersPassABI,
                            provider,
                          );

                          // Check NFT balance
                          const nftBalance = await foundersPassContract.balanceOf(internalAccount); // Use internalAccount state

                          if (nftBalance === 0n) {
                            alert("❌ You don't own any Founder's Pass NFTs");
                            return;
                          }

                          // Find all NFTs the user owns
                          const ownedTokenIds: number[] = [];

                          // Check token IDs in the expected range
                          for (let tokenId = 1; tokenId <= 150; tokenId++) {
                            try {
                              const owner = await foundersPassContract.ownerOf(tokenId);
                              if (owner.toLowerCase() === internalAccount.toLowerCase()) { // Use internalAccount state
                                ownedTokenIds.push(tokenId);
                              }
                            } catch {
                              // Token doesn't exist or not owned, continue
                            }
                          }

                          if (ownedTokenIds.length === 0) {
                            alert("❌ Could not find owned Founder's Pass NFT token IDs");
                            return;
                          }

                          console.log(`Found ${ownedTokenIds.length} owned Founder's Pass NFTs:`, ownedTokenIds);

                          // Add each NFT to MetaMask one by one
                          let successCount = 0;
                          let errorCount = 0;

                          for (const tokenId of ownedTokenIds) {
                            try {
                              await metaMask.request({
                                method: "wallet_watchAsset",
                                params: {
                                  type: "ERC721",
                                  options: {
                                    address: contractAddresses.FOUNDERS_PASS,
                                    tokenId: tokenId.toString(),
                                  },
                                },
                              });
                              successCount++;

                              // Add delay between requests to avoid rate limiting
                              if (tokenId !== ownedTokenIds[ownedTokenIds.length - 1]) {
                                await new Promise(resolve => setTimeout(resolve, 1000));
                              }
                            } catch (nftError: unknown) {
                              const error = nftError as { code?: number };
                              if (error?.code === 4001) {
                                console.log(`User rejected adding Founder's Pass NFT #${tokenId}`);
                                break; // Stop if user rejects
                              } else {
                                console.error(`Failed to add Founder's Pass NFT #${tokenId}:`, nftError);
                                errorCount++;
                              }
                            }
                          }

                          if (successCount > 0) {
                            alert(`✅ Successfully added ${successCount} Founder's Pass NFT${successCount > 1 ? 's' : ''} to your wallet!`);
                          }
                          if (errorCount > 0) {
                            alert(`⚠️ Failed to add ${errorCount} Founder's Pass NFT${errorCount > 1 ? 's' : ''}`);
                          }

                        } catch (err: unknown) {
                          const error = err as { code?: number };
                          if (error?.code === 4001) {
                            console.log("User rejected the add NFT request.");
                          } else {
                            console.error("Add Founder's Pass NFTs failed", err);
                            alert(`❌ Failed to add Founder's Pass NFTs: ${sanitizeError(err)}`);
                          }
                        } finally {
                          setIsAddingFoundersPass(false);
                        }
                      }}
                      disabled={!internalAccount || isAddingFoundersPass} // Use internalAccount state
                      className={`w-full font-bold py-1 px-3 text-xs rounded transition-colors flex items-center justify-center gap-1 ${
                        !internalAccount || isAddingFoundersPass // Use internalAccount state
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : !securityChecks.isValidChain
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : selectedNetwork === "mainnet"
                              ? "bg-purple-600 hover:bg-purple-700 text-white"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {isAddingFoundersPass ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : !internalAccount ? ( // Use internalAccount state
                        "Connect Wallet First"
                      ) : !securityChecks.isValidChain ? (
                        "Switch Network"
                      ) : (
                        "Add Founder's Pass to MetaMask"
                      )}
                    </button>

                    <p className="text-gray-400 text-xs text-center mt-2">
                      May take up to 30 seconds to add all NFTs. Check MetaMask for prompts.
                    </p>
                  </div>
                </div>
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
                      if (!internalAccount) { // Use internalAccount state
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
                          if (!internalAccount || !isValidAddress(internalAccount)) { // Use internalAccount state
                            throw new Error("Invalid account address");
                          }

                          // Initialize web3 provider with security checks
                          const { ethers } = await import("ethers");

                          const eth = typeof window !== "undefined" ? window.ethereum : undefined;
                          if (!eth) {
                            throw new Error("MetaMask provider not found");
                          }

                          const provider = new ethers.BrowserProvider(
                            eth,
                          );
                          const signer = await await provider.getSigner();

                          // Security: Validate signer address matches connected account
                          const signerAddress = await signer.getAddress();
                          if (
                            signerAddress.toLowerCase() !==
                            internalAccount.toLowerCase() // Use internalAccount state
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
                            await foundersPassContract.balanceOf(internalAccount); // Use internalAccount state
                          console.log(
                            `User owns ${nftBalance.toString()} Founder's Pass NFTs`,
                          );

                          if (nftBalance === 0n) {
                            alert(
                              "❌ No Founder's Pass NFTs found in your wallet.",
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
                                owner.toLowerCase() === internalAccount.toLowerCase() // Use internalAccount state
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
                              "❌ Could not retrieve your Founder's Pass NFT token IDs. You may not own any NFTs from this collection.",
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
                                internalAccount, // Use internalAccount state
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
                                `❌ All your Founder's Pass NFTs have already been claimed.`,
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
                    disabled={!internalAccount || isClaimingAirdrop} // Use internalAccount state
                    className={`font-bold py-2 px-6 rounded-lg transition-colors mb-2 flex items-center gap-2 justify-center ${
                      !internalAccount || isClaimingAirdrop // Use internalAccount state
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
                <p className="text-gray-400 text-xs text-center mt-2">
                  (Check MetaMask, may take up to 30s)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={disconnectWallet} // Use the updated disconnectWallet function
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