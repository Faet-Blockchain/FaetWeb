"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ethers } from "ethers";
import WalletConnection from "@/components/staking/WalletConnection";
import StakingInterface from "@/components/staking/StakingInterface";
import StakingFeatures from "@/components/staking/StakingFeatures";

declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
      isMetaMask?: boolean;
      on?: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

// Contract addresses on Lisk Sepolia
const FAET_TOKEN_ADDRESS = "0x80fD38fFDE3E77fAcE192Ea74fD510618C50f394";
const FAET_STAKING_ADDRESS = "0x84B7F164cbAEdb17E98B5EA2512e6c41121E8472";

// Simplified ABI for the functions we need
const FAET_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

const FAET_STAKING_ABI = [
  "function stake(uint256 amount, uint256 daysLocked)",
  "function withdraw(uint256 stakeIndex)",
  "function getReward()",
  "function earned(address account) view returns (uint256)",
  "function getStakeCount(address user) view returns (uint256)",
  "function getStakeView(address user, uint256 index) view returns (tuple(uint256 amount, uint256 weightedAmount, uint256 multiplier, uint256 lockEndBlock))",
  "function weightedBalances(address account) view returns (uint256)",
  "function rewards(address account) view returns (uint256)",
  "function getMultiplier(uint256 daysLocked) view returns (uint256)",
  "function getActiveWeight(address user) view returns (uint256)",
  "function totalStaked() view returns (uint256)",
  "function totalRewardsFunded() view returns (uint256)",
  "function rewardPerToken() view returns (uint256)",
  "event Staked(address indexed user, uint256 amount, uint256 duration, uint256 stakeIndex)",
  "event Withdrawn(address indexed user, uint256 amount, uint256 stakeIndex)",
  "event RewardPaid(address indexed user, uint256 reward)",
];

export default function StakingPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [showTokenStaking, setShowTokenStaking] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<'testnet' | 'mainnet'>('testnet');
  const [currentChainId, setCurrentChainId] = useState<string | null>(null);
  const [currentChainIdNumber, setCurrentChainIdNumber] = useState<number | null>(null);

  // Web3 state
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(null);
  const [stakingContract, setStakingContract] = useState<ethers.Contract | null>(null);

  // Token/Staking state
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [stakedBalance, setStakedBalance] = useState<string>("0");
  const [pendingRewards, setPendingRewards] = useState<string>("0");
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<number>(0);
  const [userStakes, setUserStakes] = useState<Array<{
    index: number;
    amount: string;
    weightedAmount: string;
    multiplier: number;
    lockEndBlock: number;
    isUnlocked: boolean;
    blocksRemaining: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>("");

  const [totalRewardsFunded, setTotalRewardsFunded] = useState<string>("0");
  const [topStakers, setTopStakers] = useState<Array<{address: string, weight: string}>>([]);
  const [stakingRanges, setStakingRanges] = useState<Array<{range: string, count: number, totalWeight: string}>>([]);

  // Lisk Sepolia testnet configuration
  const LISK_SEPOLIA_CHAIN_ID = "0x106a"; // 4202 in decimal
  const LISK_SEPOLIA_CONFIG = {
    chainId: LISK_SEPOLIA_CHAIN_ID,
    chainName: "Lisk Sepolia Testnet",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.sepolia-api.lisk.com"],
    blockExplorerUrls: ["https://sepolia-blockscout.lisk.com"],
  };

  const clearWeb3State = () => {
    setProvider(null);
    setTokenContract(null);
    setStakingContract(null);
    setTokenBalance("0");
    setStakedBalance("0");
    setPendingRewards("0");
    setUserStakes([]);

    setTotalRewardsFunded("0");
    setShowTokenStaking(false);
  };

  const checkNetwork = useCallback(async (): Promise<boolean> => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const chainId = (await window.ethereum.request({
          method: "eth_chainId",
        })) as string;

        console.log(`[checkNetwork] Raw chain ID from wallet: "${chainId}"`);
        console.log(`[checkNetwork] Required chain ID: "${LISK_SEPOLIA_CHAIN_ID}"`);
        console.log(`[checkNetwork] Type of chainId: ${typeof chainId}`);

        setCurrentChainId(chainId);

        // Convert hex strings to integers for reliable comparison
        const currentChainNumber = parseInt(chainId, 16);
        const requiredChainNumber = parseInt(LISK_SEPOLIA_CHAIN_ID, 16);

        setCurrentChainIdNumber(currentChainNumber);

        console.log(`[checkNetwork] Current chain number: ${currentChainNumber}`);
        console.log(`[checkNetwork] Required chain number: ${requiredChainNumber}`);

        const isCorrectNetwork = currentChainNumber === requiredChainNumber;
        console.log(`[checkNetwork] Networks match: ${isCorrectNetwork}`);

        setWrongNetwork(!isCorrectNetwork);

        if (!isCorrectNetwork) {
          clearWeb3State();
          console.log("[checkNetwork] Wrong network detected, clearing state");
        } else {
          console.log("[checkNetwork] Correct network confirmed");
        }

        return isCorrectNetwork;
      } catch (error) {
        console.error("[checkNetwork] Error checking network:", error);
        setWrongNetwork(true);
        setCurrentChainId(null);
        setCurrentChainIdNumber(null);
        clearWeb3State();
        return false;
      }
    } else {
      console.log("[checkNetwork] No ethereum object found");
      setWrongNetwork(true);
      setCurrentChainId(null);
      setCurrentChainIdNumber(null);
      clearWeb3State();
      return false;
    }
  }, []);

  const switchToLiskSepolia = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: LISK_SEPOLIA_CHAIN_ID }],
        });
      } catch (switchError: unknown) {
        if ((switchError as { code?: number })?.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [LISK_SEPOLIA_CONFIG],
            });
          } catch (addError) {
            console.error("Error adding network:", addError);
          }
        } else {
          console.error("Error switching network:", switchError);
        }
      }
    }
  };

  const loadTopStakersData = async (staking: ethers.Contract) => {
    try {
      console.log("Loading real blockchain staking data...");

      // Get all Stake events to find unique stakers
      const fromBlock = 0; // Start from genesis - in production, you'd want to optimize this

      console.log("Fetching Stake events from blockchain...");
      const stakeEvents = await staking.queryFilter(
        staking.filters.Staked(),
        fromBlock,
        'latest'
      );

      console.log(`Found ${stakeEvents.length} stake events`);

      // Get unique staker addresses from events
      const uniqueStakers = [...new Set(stakeEvents.map(event => {
        // Type guard to check if event is EventLog (has args property)
        if ('args' in event && event.args && event.args[0]) {
          return event.args[0];
        }
        return null;
      }).filter(Boolean))];
      console.log(`Found ${uniqueStakers.length} unique stakers`);

      if (uniqueStakers.length === 0) {
        console.log("No stakers found, using empty data");
        setTopStakers([]);
        setStakingRanges([]);
        return;
      }

      // Get current active weight for each staker
      console.log("Fetching current weights for all stakers...");
      const stakerWeights = await Promise.all(
        uniqueStakers.map(async (stakerAddress) => {
          try {
            const activeWeight = await staking.getActiveWeight(stakerAddress);
            const weightStr = ethers.formatEther(activeWeight);
            console.log(`Staker ${stakerAddress}: ${weightStr} FAET`);
            return {
              address: stakerAddress,
              weight: weightStr
            };
          } catch (error) {
            console.warn(`Failed to get weight for ${stakerAddress}:`, error);
            return {
              address: stakerAddress,
              weight: "0"
            };
          }
        })
      );

      // Filter out zero balances and sort by weight (highest first), take top 10
      const activeStakers = stakerWeights.filter(staker => parseFloat(staker.weight) > 0);
      const sortedStakers = activeStakers
        .sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight))
        .slice(0, 10);

      console.log(`Found ${activeStakers.length} active stakers, showing top ${sortedStakers.length}`);
      setTopStakers(sortedStakers);

      // Create 5 distribution ranges with real data
      const ranges = [
        { min: 0, max: 10000, label: "0-10K" },
        { min: 10000, max: 100000, label: "10K-100K" },
        { min: 100000, max: 500000, label: "100K-500K" },
        { min: 500000, max: 1000000, label: "500K-1M" },
        { min: 1000000, max: Infinity, label: "1M+" }
      ];

      // Categorize actual stakers into ranges
      const distributionData = ranges.map(range => {
        const stakersInRange = activeStakers.filter(staker => {
          const weight = parseFloat(staker.weight);
          return weight >= range.min && weight < range.max;
        });

        const totalWeight = stakersInRange.reduce((sum, staker) => sum + parseFloat(staker.weight), 0);

        return {
          range: range.label,
          count: stakersInRange.length,
          totalWeight: totalWeight.toFixed(2)
        };
      }).filter(item => item.count > 0); // Only show ranges with stakers

      console.log("Distribution data:", distributionData);
      setStakingRanges(distributionData);

    } catch (error) {
      console.error("Error loading top stakers data:", error);
      // Set empty data on error
      setTopStakers([]);
      setStakingRanges([]);
    }
  };

  const loadUserData = async (
    token: ethers.Contract,
    staking: ethers.Contract,
    userAddress: string,
  ) => {
    try {
      console.log("Loading user data for:", userAddress);
      console.log("Staking contract address:", await staking.getAddress());
      console.log("Token contract address:", await token.getAddress());

      // Get current block number from the provider
      let currentBlock = 0;
      if (provider) {
        currentBlock = await provider.getBlockNumber();
      } else if (typeof window.ethereum !== "undefined") {
        // Fallback: create a temporary provider to get block number
        const tempProvider = new ethers.BrowserProvider(window.ethereum);
        currentBlock = await tempProvider.getBlockNumber();
      }

      console.log("Current block number:", currentBlock);

      // Get token balance
      try {
        const balance = await token.balanceOf(userAddress);
        setTokenBalance(ethers.formatEther(balance));
      } catch (error: unknown) {
        console.error("Error fetching token balance:", error);
        setTokenBalance("0");
      }

      // Get weighted balance (active staking weight)
      try {
        // Try getActiveWeight first since it's the actual current active weight
        const activeWeight = await staking.getActiveWeight(userAddress);
        setStakedBalance(ethers.formatEther(activeWeight));
        console.log("Successfully fetched active weight:", ethers.formatEther(activeWeight));
      } catch (error: unknown) {
        console.warn("Error fetching active weight:", (error as { code?: string | number; message?: string })?.code || (error as { message?: string })?.message);
        // Try weightedBalances as fallback
        try {
          const weighted = await staking.weightedBalances(userAddress);
          setStakedBalance(ethers.formatEther(weighted));
          console.log("Successfully fetched weighted balance:", ethers.formatEther(weighted));
        } catch (fallbackError: unknown) {
          console.warn("Error fetching weighted balances:", (fallbackError as { code?: string | number; message?: string })?.code || (fallbackError as { message?: string })?.message);
          setStakedBalance("0");
        }
      }

      // Get pending rewards with fallback handling
      try {
        const earned = await staking.earned(userAddress);
        setPendingRewards(ethers.formatEther(earned));
        console.log("Successfully fetched earnings:", ethers.formatEther(earned));
      } catch (error: unknown) {
        console.warn("Error fetching earnings (contract may not exist or wrong network):", (error as { code?: string | number; message?: string })?.code || (error as { message?: string })?.message);
        setPendingRewards("0");
      }



      // Get total rewards funded
      try {
        const totalFunded = await staking.totalRewardsFunded();
        setTotalRewardsFunded(ethers.formatEther(totalFunded));
        console.log("Successfully fetched total rewards funded:", ethers.formatEther(totalFunded));
      } catch (error: unknown) {
        console.warn("Error fetching total rewards funded:", (error as { code?: string | number; message?: string })?.code || (error as { message?: string })?.message);
        setTotalRewardsFunded("0");
      }

      // Get user stakes with proper error handling
      try {
        const stakeCount = await staking.getStakeCount(userAddress);
        const stakeCountNumber = Number(stakeCount);
        console.log("Successfully fetched stake count:", stakeCountNumber);

        if (stakeCountNumber === 0) {
          console.log("User has no stakes");
          setUserStakes([]);
          return;
        }

        const stakes = [];

        for (let i = 0; i < stakeCountNumber; i++) {
          try {
            const stakeView = await staking.getStakeView(userAddress, i);
            // stakeView is a struct with: amount, weightedAmount, multiplier, lockEndBlock
            const amount = stakeView[0];
            const weightedAmount = stakeView[1];
            const multiplier = stakeView[2];
            const lockEndBlock = Number(stakeView[3]);

            const isUnlocked = lockEndBlock === 0 || currentBlock >= lockEndBlock;
            const blocksRemaining = isUnlocked ? 0 : Math.max(0, lockEndBlock - currentBlock);

            console.log(`Stake ${i} details:`, {
              currentBlock,
              lockEndBlock,
              blocksRemaining,
              daysRemaining: Math.ceil(blocksRemaining / 43200),
              amount: amount.toString(),
              weightedAmount: weightedAmount.toString(),
              multiplier: multiplier.toString()
            });

            stakes.push({
              index: i,
              amount: ethers.formatEther(amount),
              weightedAmount: ethers.formatEther(weightedAmount),
              multiplier: Number(multiplier) / 1e18, // Convert from wei to decimal
              lockEndBlock: lockEndBlock,
              isUnlocked: isUnlocked,
              blocksRemaining: blocksRemaining,
            });
          } catch (stakeError) {
            console.error(`Error loading stake ${i}:`, stakeError);
          }
        }
        setUserStakes(stakes);
        console.log("Successfully loaded", stakes.length, "stakes");
      } catch (error: unknown) {
        console.warn("Error loading stakes (contract may not exist or wrong network):", (error as { code?: string | number; message?: string })?.code || (error as { message?: string })?.message);
        setUserStakes([]);
      }

      // Load top stakers data
      await loadTopStakersData(staking);
    } catch (error: unknown) {
      console.error("Critical error loading user data:", (error as { message?: string })?.message || error);
      if ((error as { code?: string })?.code === "BAD_DATA") {
        console.warn("Contract decode error - likely wrong network or contract not deployed");
      }
      // Set fallback values
      setTokenBalance("0");
      setStakedBalance("0");
      setPendingRewards("0");

      setUserStakes([]);
      setTotalRewardsFunded("0");
    }
  };

  const initializeWeb3 = useCallback(async () => {
    if (typeof window.ethereum !== "undefined" && account) {
      try {
        console.log("Initializing Web3 for account:", account);

        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);

        const signer = await web3Provider.getSigner();
        const signerAddress = await signer.getAddress();
        console.log("Signer address:", signerAddress);

        const token = new ethers.Contract(
          FAET_TOKEN_ADDRESS,
          FAET_TOKEN_ABI,
          signer,
        );
        const staking = new ethers.Contract(
          FAET_STAKING_ADDRESS,
          FAET_STAKING_ABI,
          signer,
        );

        setTokenContract(token);
        setStakingContract(staking);

        console.log("Token contract address:", FAET_TOKEN_ADDRESS);
        console.log("Staking contract address:", FAET_STAKING_ADDRESS);
        console.log("Current chain ID:", currentChainId);

        // Validate contracts exist by checking if they have code
        try {
          const tokenCode = await web3Provider.getCode(FAET_TOKEN_ADDRESS);
          const stakingCode = await web3Provider.getCode(FAET_STAKING_ADDRESS);

          if (tokenCode === "0x") {
            console.error("Token contract not found at address:", FAET_TOKEN_ADDRESS);
          } else {
            console.log("Token contract validated");
          }

          if (stakingCode === "0x") {
            console.error("Staking contract not found at address:", FAET_STAKING_ADDRESS);
          } else {
            console.log("Staking contract validated");
          }

          if (tokenCode === "0x" || stakingCode === "0x") {
            console.warn("One or more contracts not deployed on this network");
          }
        } catch (codeError) {
          console.warn("Could not validate contract deployment:", codeError);
        }

        console.log("Contracts initialized, loading user data...");
        await loadUserData(token, staking, account);
        console.log("Web3 initialization complete");
      } catch (error: unknown) {
        console.error("Error initializing Web3:", (error as { message?: string })?.message || error);
        clearWeb3State();
      }
    } else {
      console.log("Cannot initialize Web3: missing ethereum or account");
      clearWeb3State();
    }
  }, [account, currentChainId]);

  const connectMetaMask = async () => {
    if (typeof window.ethereum !== "undefined") {
      setIsConnecting(true);
      try {
        const accounts = (await window.ethereum.request({
          method: "eth_requestAccounts",
        })) as string[];

        if (accounts.length > 0) {
          setAccount(accounts[0]);

          // Immediate network check after connection
          const networkOk = await checkNetwork();
          if (networkOk) {
            console.log("Connected to correct network, initializing Web3");
            // Initialize Web3 immediately if on correct network
            setTimeout(async () => {
              await initializeWeb3();
            }, 500);
          } else {
            console.log("Connected to wrong network, will not initialize Web3");
          }
        } else {
          console.error("No accounts returned from MetaMask");
        }
      } catch (error: unknown) {
        console.error("Error connecting wallet:", error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      console.error("MetaMask is not installed");
    }
  };

  const handleStake = async () => {
    if (!tokenContract || !stakingContract || !stakeAmount) return;

    const networkOk = await checkNetwork();
    if (!networkOk) {
      console.error("Cannot stake: wrong network");
      return;
    }

    setIsLoading(true);
    setTxHash("");

    try {
      const amount = ethers.parseEther(stakeAmount);

      const balance = await tokenContract.balanceOf(account);
      if (balance < amount) {
        console.error("Insufficient FAET token balance");
        setIsLoading(false);
        return;
      }

      const allowance = await tokenContract.allowance(account, FAET_STAKING_ADDRESS);
      if (allowance < amount) {
        console.log("Approving tokens...");
        const approveTx = await tokenContract.approve(FAET_STAKING_ADDRESS, amount);
        await approveTx.wait();
        console.log("Approval confirmed");
      }

      console.log("Staking tokens...");
      // Contract now takes days directly as the second parameter
      const stakeTx = await stakingContract.stake(amount, selectedDays);
      setTxHash(stakeTx.hash);
      await stakeTx.wait();

      if (account) {
        await loadUserData(tokenContract, stakingContract, account);
      }
      setStakeAmount("");
      console.log("Staking successful!");
    } catch (error: unknown) {
      // Handle different types of errors gracefully
      if ((error as { code?: number | string })?.code === 4001 || (error as { code?: number | string })?.code === "ACTION_REJECTED") {
        console.log('ℹ️ User cancelled staking transaction');
      } else if ((error as { code?: number })?.code === -32002) {
        console.log('⚠️ Staking request already pending in MetaMask');
      } else if ((error as { reason?: string })?.reason === "Insufficient funded rewards") {
        console.error("❌ Staking failed: Contract has insufficient rewards");
      } else {
        console.error("Staking failed:", (error as { reason?: string })?.reason || (error as { message?: string })?.message || "Unknown error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (stakeIndex: number) => {
    if (!stakingContract) return;

    const networkOk = await checkNetwork();
    if (!networkOk) {
      console.error("Cannot withdraw: wrong network");
      return;
    }

    setIsLoading(true);

    try {
      const withdrawTx = await stakingContract.withdraw(stakeIndex);
      setTxHash(withdrawTx.hash);
      await withdrawTx.wait();

      if (account) {
        await loadUserData(tokenContract!, stakingContract, account);
      }
      console.log("Withdrawal successful!");
    } catch (error: unknown) {
      // Handle different types of errors gracefully
      if ((error as { code?: number | string })?.code === 4001 || (error as { code?: number | string })?.code === "ACTION_REJECTED") {
        console.log('ℹ️ User cancelled withdrawal transaction');
      } else if ((error as { code?: number })?.code === -32002) {
        console.log('⚠️ Withdrawal request already pending in MetaMask');
      } else {
        console.error("Withdrawal failed:", (error as { reason?: string })?.reason || (error as { message?: string })?.message || "Unknown error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!stakingContract) return;

    const networkOk = await checkNetwork();
    if (!networkOk) {
      console.error("Cannot claim rewards: wrong network");
      return;
    }

    setIsLoading(true);
    setTxHash("");

    try {
      const claimTx = await stakingContract.getReward();
      setTxHash(claimTx.hash);
      await claimTx.wait();

      if (account) {
        await loadUserData(tokenContract!, stakingContract, account);
      }
      console.log("Rewards claimed successfully!");
    } catch (error: unknown) {
      // Handle different types of errors gracefully
      if ((error as { code?: number | string })?.code === 4001 || (error as { code?: number | string })?.code === "ACTION_REJECTED") {
        console.log('ℹ️ User cancelled claim rewards transaction');
        // Don't show alert for user cancellation - it's expected behavior
      } else if ((error as { code?: number })?.code === -32002) {
        console.log('⚠️ Claim request already pending in MetaMask');
      } else if ((error as { reason?: string })?.reason === "Insufficient funded rewards" || 
                 (error as { message?: string })?.message?.includes("Insufficient funded rewards")) {
        console.error("❌ Claim Failed: Insufficient funded rewards");
        alert("❌ Claim Failed: The reward pool is currently empty. Please wait for the pool to be refunded by the administrators.");
      } else if ((error as { reason?: string })?.reason === "No rewards" || 
                 (error as { message?: string })?.message?.includes("No rewards")) {
        console.error("❌ Claim Failed: No rewards available");
        alert("❌ Claim Failed: You have no rewards to claim at this time.");
      } else {
        console.error("Claim failed:", (error as { reason?: string })?.reason || (error as { message?: string })?.message || "Unknown error");
        alert(`❌ Claim Failed: ${(error as { reason?: string })?.reason || (error as { message?: string })?.message || "Unknown error occurred"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };



  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setWrongNetwork(false);
    setCurrentChainId(null);
    clearWeb3State();
  }, []);

  const handleGoToStaking = async () => {
    // Only proceed if we're already on the correct network
    if (!wrongNetwork && canAccessStaking) {
      setShowTokenStaking(true);
      setTimeout(() => scrollToSection("token-staking"), 100);
    } else {
      // This shouldn't happen since the button should show "Switch Network" instead
      console.error("handleGoToStaking called while on wrong network or not eligible");
    }
  };

  // Network detection and event handling
  useEffect(() => {
    if (typeof window.ethereum !== "undefined" && window.ethereum.on) {
      const handleChainChanged = async (chainId: string) => {
        console.log("[handleChainChanged] Chain changed event fired");
        console.log("[handleChainChanged] Event chain ID:", chainId);
        console.log("[handleChainChanged] Type:", typeof chainId);

        // Add delay to ensure wallet state is fully updated
        setTimeout(async () => {
          console.log("[handleChainChanged] Checking network after delay...");

          // Force fresh read from wallet instead of using event data
          let actualChainId;
          try {
            actualChainId = (await window.ethereum!.request({
              method: "eth_chainId",
            })) as string;
            console.log("[handleChainChanged] Fresh chain ID from wallet:", actualChainId);
          } catch (error) {
            console.error("[handleChainChanged] Error reading fresh chain ID:", error);
            return;
          }

          setCurrentChainId(actualChainId);

          // Convert hex strings to integers for reliable comparison
          const currentChainNumber = parseInt(actualChainId, 16);
          const requiredChainNumber = parseInt(LISK_SEPOLIA_CHAIN_ID, 16);

          setCurrentChainIdNumber(currentChainNumber);

          console.log("[handleChainChanged] Fresh current chain number:", currentChainNumber);
          console.log("[handleChainChanged] Fresh required chain number:", requiredChainNumber);

          const isCorrectNetwork = currentChainNumber === requiredChainNumber;
          console.log("[handleChainChanged] Fresh networks match:", isCorrectNetwork);

          setWrongNetwork(!isCorrectNetwork);

          if (!isCorrectNetwork) {
            console.log("[handleChainChanged] Wrong network detected, clearing state and hiding staking interface");
            clearWeb3State();
            setShowTokenStaking(false);
          } else if (account) {
            console.log("[handleChainChanged] Correct network detected, reinitializing Web3");
            setTimeout(async () => {
              await initializeWeb3();
            }, 500);
          }
        }, 500); // 500ms delay to let wallet update
      };

      const handleAccountsChanged = async (accounts: string[]) => {
        console.log("Accounts changed:", accounts);
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
          // Always check network when account changes
          const networkOk = await checkNetwork();
          if (!networkOk) {
            clearWeb3State();
            setShowTokenStaking(false);
          }
        }
      };

      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('chainChanged', handleChainChanged);
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [account, checkNetwork, disconnectWallet, initializeWeb3]);

  // Continuous network monitoring when user is connected
  useEffect(() => {
    let networkCheckInterval: NodeJS.Timeout;

    if (account && typeof window.ethereum !== "undefined") {
      // Check network every 2 seconds when connected
      networkCheckInterval = setInterval(async () => {
        await checkNetwork();
      }, 2000);
    }

    return () => {
      if (networkCheckInterval) {
        clearInterval(networkCheckInterval);
      }
    };
  }, [account, checkNetwork]);

  // Initialize on mount and when account changes
  useEffect(() => {
    const initialize = async () => {
      // Check if already connected
      if (typeof window.ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" }) as string[];
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            // Check network immediately after setting account
            const networkOk = await checkNetwork();
            if (!networkOk) {
              console.log("Auto-connected wallet is on wrong network");
              setShowTokenStaking(false);
            }
          } else {
            // No accounts connected, still check network for UI state
            await checkNetwork();
          }
        } catch (error: unknown) {
          console.error("Error checking existing connection:", error);
          await checkNetwork();
        }
      }
    };

    initialize();
  }, [checkNetwork]);

  // Update pending rewards every 30 seconds
  useEffect(() => {
    let rewardsUpdateInterval: NodeJS.Timeout;

    if (stakingContract && account && !wrongNetwork && provider) {
      const updatePendingRewards = async () => {
        try {
          const timestamp = new Date().toLocaleTimeString();
          console.log(`[${timestamp}] Updating pending rewards...`);

          // Get current block number first
          const currentBlock = await provider.getBlockNumber();
          console.log(`[${timestamp}] Current block:`, currentBlock);

          // Create a fresh read-only contract instance to bypass any caching
          const freshContract = new ethers.Contract(
            FAET_STAKING_ADDRESS,
            ["function earned(address account) view returns (uint256)"],
            provider
          );

          const earned = await freshContract.earned(account);
          const formattedEarned = ethers.formatEther(earned);
          console.log(`[${timestamp}] New pending rewards:`, formattedEarned, `(block: ${currentBlock})`);
          setPendingRewards(formattedEarned);
        } catch (error: unknown) {
          console.warn("Error updating pending rewards:", error);
        }
      };

      // Update immediately
      updatePendingRewards();

      // Then update every 2 seconds for real-time updates
      rewardsUpdateInterval = setInterval(updatePendingRewards, 2000);
      console.log("Started 2-second rewards update interval");
    } else {
      console.log("Not starting rewards interval - missing:", {
        stakingContract: !!stakingContract,
        account: !!account,
        wrongNetwork
      });
    }

    return () => {
      if (rewardsUpdateInterval) {
        console.log("Clearing rewards update interval");
        clearInterval(rewardsUpdateInterval);
      }
    };  }, [stakingContract, account, wrongNetwork, provider]);

  // Only allow staking interface if connected to correct network
  const canAccessStaking = account && !wrongNetwork && currentChainIdNumber === parseInt(LISK_SEPOLIA_CHAIN_ID, 16) && selectedNetwork === 'testnet';

  // Initialize Web3 when account and network are both correct
  useEffect(() => {
    const initWeb3IfReady = async () => {
      if (account && !wrongNetwork && currentChainIdNumber === parseInt(LISK_SEPOLIA_CHAIN_ID, 16)) {
        console.log("Auto-initializing Web3 due to state change");
        await initializeWeb3();
      }
    };

    initWeb3IfReady();
  }, [account, wrongNetwork, currentChainIdNumber, initializeWeb3]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
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
          className="text-lg mb-6 max-w-3xl"
        >
          Stake your FAET tokens and NFTs to earn rewards and unlock exclusive
          platform benefits. Connect your MetaMask wallet to get started with
          staking on the FAET platform.
        </motion.p>

        {!showTokenStaking && (
          <WalletConnection
            account={account}
            isConnecting={isConnecting}
            wrongNetwork={wrongNetwork}
            currentChainId={currentChainId}
            selectedNetwork={selectedNetwork}
            canAccessStaking={canAccessStaking}
            onConnect={connectMetaMask}
            onDisconnect={disconnectWallet}
            onSwitchNetwork={switchToLiskSepolia}
            onGoToStaking={handleGoToStaking}
            onNetworkChange={setSelectedNetwork}
          />
        )}

        {showTokenStaking && canAccessStaking && (
          <StakingInterface
            account={account!}
            tokenBalance={tokenBalance}
            stakedBalance={stakedBalance}
            pendingRewards={pendingRewards}
            stakeAmount={stakeAmount}
            selectedDays={selectedDays}
            userStakes={userStakes}
            isLoading={isLoading}
            txHash={txHash}
            wrongNetwork={wrongNetwork}
            totalRewardsFunded={totalRewardsFunded}
            topStakers={topStakers}
            stakingRanges={stakingRanges}
            onStakeAmountChange={setStakeAmount}
            onSelectedDaysChange={setSelectedDays}
            onStake={handleStake}
            onWithdraw={handleWithdraw}
            onClaimRewards={handleClaimRewards}
            onBackToOverview={() => setShowTokenStaking(false)}
          />
        )}

        {!showTokenStaking && <StakingFeatures />}
      </div>
    </div>
  );
}