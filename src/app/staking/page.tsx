"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ethers } from "ethers";
import WalletConnection from "@/components/staking/WalletConnection";
import StakingInterface from "@/components/staking/StakingInterface";
import StakingFeatures from "@/components/staking/StakingFeatures";
import { getNetworkConfig } from "@/lib/networks";

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
  "uint256 public totalWeightedSupply",
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
  const [selectedNetwork, setSelectedNetwork] = useState<'testnet' | 'mainnet'>('mainnet');
  const [currentChainId, setCurrentChainId] = useState<string | null>(null);
  const [currentChainIdNumber, setCurrentChainIdNumber] = useState<number | null>(null);

  // Web3 state
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
  const [totalStakeWeight, setTotalStakeWeight] = useState<string>("0");
  const [topStakers, setTopStakers] = useState<Array<{address: string, weight: string}>>([]);
  const [stakingRanges, setStakingRanges] = useState<Array<{range: string, count: number, totalWeight: string}>>([]);

  // Get current network configuration
  const currentNetworkConfig = getNetworkConfig(selectedNetwork);
  const FAET_TOKEN_ADDRESS = currentNetworkConfig.contracts.token;
  const FAET_STAKING_ADDRESS = currentNetworkConfig.contracts.staking;
  const REQUIRED_CHAIN_ID = currentNetworkConfig.chainId;

  const clearWeb3State = useCallback(() => {
    setTokenContract(null);
    setStakingContract(null);
    setTokenBalance("0");
    setStakedBalance("0");
    setPendingRewards("0");
    setUserStakes([]);
    setTotalRewardsFunded("0");
    setTotalStakeWeight("0");
    setTopStakers([]);
    setStakingRanges([]);
    setShowTokenStaking(false);
  }, []);

  const checkNetwork = useCallback(async (): Promise<boolean> => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const chainId = (await window.ethereum.request({
          method: "eth_chainId",
        })) as string;

        // Get the current network config based on selected network
        const networkConfig = getNetworkConfig(selectedNetwork);
        const requiredChainId = networkConfig.chainId;
        const requiredChainNumber = networkConfig.chainIdNumber;

        setCurrentChainId(chainId);

        // Convert hex strings to integers for reliable comparison
        const currentChainNumber = parseInt(chainId, 16);
        setCurrentChainIdNumber(currentChainNumber);

        // Check both hex and decimal formats
        const isCorrectNetwork = chainId === requiredChainId || currentChainNumber === requiredChainNumber;

        setWrongNetwork(!isCorrectNetwork);

        if (!isCorrectNetwork) {
          clearWeb3State();
        }

        return isCorrectNetwork;
      } catch {
        console.error("Network check failed");
        setWrongNetwork(true);
        setCurrentChainId(null);
        setCurrentChainIdNumber(null);
        clearWeb3State();
        return false;
      }
    } else {
      setWrongNetwork(true);
      setCurrentChainId(null);
      setCurrentChainIdNumber(null);
      clearWeb3State();
      return false;
    }
  }, [clearWeb3State, selectedNetwork]); // Add selectedNetwork to dependencies

  const switchToCurrentNetwork = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: REQUIRED_CHAIN_ID }],
        });
      } catch (switchError: unknown) {
        if ((switchError as { code?: number })?.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: currentNetworkConfig.chainId,
                chainName: currentNetworkConfig.name,
                nativeCurrency: currentNetworkConfig.nativeCurrency,
                rpcUrls: [currentNetworkConfig.rpcUrl],
                blockExplorerUrls: [currentNetworkConfig.blockExplorerUrl],
              }],
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
      // Set initial loading state
      setTopStakers([]);
      setStakingRanges([]);

      // Get all Stake events to find unique stakers
      const fromBlock = 0; // Start from genesis - in production, you'd want to optimize this

      const stakeEvents = await staking.queryFilter(
        staking.filters.Staked(),
        fromBlock,
        'latest'
      );

      // Get unique stakers and their current active weights
      const uniqueStakers = new Set<string>();

      for (const event of stakeEvents) {
        // Type guard to check if event is EventLog (has args property)
        if ('args' in event && event.args) {
          const userAddress = event.args.user || '';
          if (userAddress) {
            uniqueStakers.add(userAddress);
          }
        }
      }

      // Calculate current active weights for each staker
      const stakersWithWeights: Array<{ address: string; weight: string }> = [];

      for (const staker of uniqueStakers) {
        if (!staker || staker === '') continue;

        try {
          const activeWeight = await staking.getActiveWeight(staker);
          const weightInEther = ethers.formatEther(activeWeight);

          if (parseFloat(weightInEther) > 0) {
            stakersWithWeights.push({
              address: staker,
              weight: weightInEther
            });
          }
        } catch {
          // Silently skip failed stakers
        }
      }

      // Sort by weight (highest first) and take top 10
      stakersWithWeights.sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));
      const top10 = stakersWithWeights.slice(0, 10);

      // Create staking ranges
      const ranges = [
        { min: 0, max: 1000, range: "0 - 1K FAET" },
        { min: 1000, max: 10000, range: "1K - 10K FAET" },
        { min: 10000, max: 100000, range: "10K - 100K FAET" },
        { min: 100000, max: 1000000, range: "100K - 1M FAET" },
        { min: 1000000, max: Infinity, range: "1M+ FAET" }
      ];

      const stakingRangesData = ranges.map(rangeConfig => {
        const stakersInRange = stakersWithWeights.filter(staker => {
          const weight = parseFloat(staker.weight);
          return weight >= rangeConfig.min && weight < rangeConfig.max;
        });

        const totalWeight = stakersInRange.reduce((sum, staker) => {
          return sum + parseFloat(staker.weight);
        }, 0);

        return {
          range: rangeConfig.range,
          count: stakersInRange.length,
          totalWeight: totalWeight.toString()
        };
      }).filter(range => range.count > 0); // Only include ranges with stakers

      // Update state
      setTopStakers(top10);
      setStakingRanges(stakingRangesData);

    } catch {
      console.error("Failed to load staking data:");

      // Set empty data as fallback
      setTopStakers([]);
      setStakingRanges([]);
    }
  };

  const loadUserData = useCallback(async (
    token: ethers.Contract,
    staking: ethers.Contract,
    userAddress: string,
  ) => {
    try {
      // For mainnet, validate network first
      if (selectedNetwork === 'mainnet') {
        const networkValid = await checkNetwork();
        if (!networkValid) {
          return;
        }
      }

      // Get current block number from the provider
      let currentBlock = 0;
      try {
        if (typeof window.ethereum !== "undefined") {
          const tempProvider = new ethers.BrowserProvider(window.ethereum);
          currentBlock = await tempProvider.getBlockNumber();
        }
      } catch {
        currentBlock = 0;
      }

      // Get token balance
      try {
        const balance = await token.balanceOf(userAddress);
        setTokenBalance(ethers.formatEther(balance));
      } catch {
        setTokenBalance("0");
      }

      // Calculate active staking weight from unlocked stakes only
      let totalActiveWeight = BigInt(0);
      try {
        const stakeCount = await staking.getStakeCount(userAddress);
        const stakeCountNumber = Number(stakeCount);

        if (stakeCountNumber > 0) {
          for (let i = 0; i < stakeCountNumber; i++) {
            try {
              const stakeView = await staking.getStakeView(userAddress, i);
              const weightedAmount = stakeView[1]; // weightedAmount is at index 1
              const lockEndBlock = Number(stakeView[3]); // lockEndBlock is at index 3

              // Only count stakes that are unlocked (lockEndBlock = 0 or current block >= lockEndBlock)
              if (lockEndBlock === 0 || currentBlock >= lockEndBlock) {
                totalActiveWeight += BigInt(weightedAmount.toString());
              }
            } catch {
              // Skip failed individual stake reads
            }
          }
        }

        setStakedBalance(ethers.formatEther(totalActiveWeight));
      } catch {
        // Fallback: try the contract's getActiveWeight if it exists
        try {
          const activeWeight = await staking.getActiveWeight(userAddress);
          setStakedBalance(ethers.formatEther(activeWeight));
        } catch {
          setStakedBalance("0");
        }
      }

      // Get pending rewards
      try {
        const earned = await staking.earned(userAddress);
        setPendingRewards(ethers.formatEther(earned));
      } catch {
        setPendingRewards("0");
      }

      // Get total rewards funded
      try {
        const totalFunded = await staking.totalRewardsFunded();
        setTotalRewardsFunded(ethers.formatEther(totalFunded));
      } catch {
        setTotalRewardsFunded("0");
      }

      // Get total stake weight from totalWeightedSupply public variable
      try {
        const totalWeighted = await staking.totalWeightedSupply();
        setTotalStakeWeight(ethers.formatEther(totalWeighted));
      } catch {
        // Fallback: try totalStaked if totalWeightedSupply doesn't exist
        try {
          const totalStaked = await staking.totalStaked();
          setTotalStakeWeight(ethers.formatEther(totalStaked));
        } catch {
          setTotalStakeWeight("0");
        }
      }

      // Get user stakes
      try {
        const stakeCount = await staking.getStakeCount(userAddress);
        const stakeCountNumber = Number(stakeCount);

        if (stakeCountNumber === 0) {
          setUserStakes([]);
        } else {
          const stakes = [];

          for (let i = 0; i < stakeCountNumber; i++) {
            try {
              const stakeView = await staking.getStakeView(userAddress, i);
              const amount = stakeView[0];
              const weightedAmount = stakeView[1];
              const multiplier = stakeView[2];
              const lockEndBlock = Number(stakeView[3]);

              const isUnlocked = lockEndBlock === 0 || currentBlock >= lockEndBlock;
              const blocksRemaining = isUnlocked ? 0 : Math.max(0, lockEndBlock - currentBlock);

              stakes.push({
                index: i,
                amount: ethers.formatEther(amount),
                weightedAmount: ethers.formatEther(weightedAmount),
                multiplier: Number(multiplier) / 1e18,
                lockEndBlock: lockEndBlock,
                isUnlocked: isUnlocked,
                blocksRemaining: blocksRemaining,
              });
            } catch {
              // Skip failed stakes
            }
          }
          setUserStakes(stakes);
        }
      } catch {
        setUserStakes([]);
      }

      // Load top stakers data
      try {
        await loadTopStakersData(staking);
      } catch {
        setTopStakers([]);
        setStakingRanges([]);
      }

    } catch (error: unknown) {
      console.error("Error loading user data:", (error as { message?: string })?.message || error);

      // Set fallback values but keep interface visible
      setTokenBalance("0");
      setStakedBalance("0");
      setPendingRewards("0");
      setUserStakes([]);
      setTotalRewardsFunded("0");
      setTotalStakeWeight("0");
      setTopStakers([]);
      setStakingRanges([]);
    }
  }, [checkNetwork, selectedNetwork, loadTopStakersData]);

  const initializeWeb3 = useCallback(async () => {
    if (typeof window.ethereum !== "undefined" && account) {
      try {
        // Double-check we're on the correct network before initializing
        const networkValid = await checkNetwork();
        if (!networkValid) {
          clearWeb3State();
          return;
        }

        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await web3Provider.getSigner();
        const signerAddress = await signer.getAddress();

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

        // Set contracts in state
        setTokenContract(token);
        setStakingContract(staking);

        // Validate contracts exist by checking if they have code
        try {
          const tokenCode = await web3Provider.getCode(FAET_TOKEN_ADDRESS);
          const stakingCode = await web3Provider.getCode(FAET_STAKING_ADDRESS);

          if (tokenCode === "0x" || stakingCode === "0x") {
            console.error("Contracts not deployed on this network");
            return;
          }
        } catch (codeError) {
          console.warn("Could not validate contract deployment:", codeError);
          return;
        }

        // For mainnet, do final network check
        if (selectedNetwork === 'mainnet') {
          const finalNetworkCheck = await checkNetwork();
          if (!finalNetworkCheck) {
            clearWeb3State();
            return;
          }
        }

        // Load user data
        try {
          await loadUserData(token, staking, signerAddress);
        } catch {
          // Keep interface visible even if data loading fails
        }

        // Load top stakers data independently
        try {
          await loadTopStakersData(staking);
        } catch {
          // Silently handle stakers data failure
        }

      } catch (error: unknown) {
        console.error("Web3 initialization failed:", (error as { message?: string })?.message || error);
        clearWeb3State();
      }
    } else {
      clearWeb3State();
    }
  }, [account, selectedNetwork, loadUserData, clearWeb3State, checkNetwork, FAET_TOKEN_ADDRESS, FAET_STAKING_ADDRESS, loadTopStakersData]);

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
            // Initialize Web3 immediately if on correct network
            setTimeout(async () => {
              await initializeWeb3();
            }, 500);
          }
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

      if (account && tokenContract && stakingContract) {
        await loadUserData(tokenContract, stakingContract, account);
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

      if (account && tokenContract && stakingContract) {
        await loadUserData(tokenContract, stakingContract, account);
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
  }, [clearWeb3State]);

  const handleGoToStaking = async () => {
    // Check prerequisites without causing state updates
    if (!account) {
      return;
    }

    // Always show the staking interface when explicitly requested
    // The StakingInterface component will handle network validation and show appropriate errors
    setShowTokenStaking(true);
    setTimeout(() => scrollToSection("token-staking"), 100);
  };

  const handleNetworkChange = (network: 'testnet' | 'mainnet') => {
    // Clear all state when switching networks to prevent data mixing
    clearWeb3State();

    // Force hide staking interface immediately to prevent cross-network calls
    setShowTokenStaking(false);

    // Set new network
    setSelectedNetwork(network);

    // Force immediate network check after state update
    setTimeout(async () => {
      const newNetworkConfig = getNetworkConfig(network);

      if (typeof window.ethereum !== "undefined") {
        try {
          const chainId = (await window.ethereum.request({
            method: "eth_chainId",
          })) as string;

          setCurrentChainId(chainId);
          const currentChainNumber = parseInt(chainId, 16);
          const requiredChainNumber = newNetworkConfig.chainIdNumber;
          setCurrentChainIdNumber(currentChainNumber);

          const isCorrectNetwork = currentChainNumber === requiredChainNumber;
          setWrongNetwork(!isCorrectNetwork);
        } catch {
          console.error("Network check failed");
          setWrongNetwork(true);
        }
      }
    }, 100);
  };

  // Network detection and event handling
  useEffect(() => {
    if (typeof window.ethereum !== "undefined" && window.ethereum.on) {
      const handleChainChanged = async (...args: unknown[]) => {
        // Add delay to ensure wallet state is fully updated
        setTimeout(async () => {
          // Force fresh read from wallet instead of using event data
          let actualChainId;
          try {
            actualChainId = (await window.ethereum!.request({
              method: "eth_chainId",
            })) as string;
          } catch {
            console.error("Error reading chain ID:");
            return;
          }

          setCurrentChainId(actualChainId);

          // Get the current network config for the selected network
          const currentNetworkConfig = getNetworkConfig(selectedNetwork);
          const currentChainNumber = parseInt(actualChainId, 16);
          const requiredChainNumber = currentNetworkConfig.chainIdNumber;

          setCurrentChainIdNumber(currentChainNumber);

          const isCorrectNetwork = currentChainNumber === requiredChainNumber;
          setWrongNetwork(!isCorrectNetwork);

          if (!isCorrectNetwork) {
            // For testnet, don't hide the interface - let it show network error messages
            if (selectedNetwork === 'mainnet') {
              clearWeb3State();
              setShowTokenStaking(false);
            } else {
              clearWeb3State();
            }
          } else if (account) {
            setTimeout(async () => {
              await initializeWeb3();
            }, 500);
          }
        }, 500); // 500ms delay to let wallet update
      };

      const handleAccountsChanged = async (...args: unknown[]) => {
        const accounts = args[0] as string[];
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
          // Always check network when account changes
          const networkOk = await checkNetwork();
          if (!networkOk) {
            clearWeb3State();
            // For testnet, keep the interface visible to show network errors
            if (selectedNetwork === 'mainnet') {
              setShowTokenStaking(false);
            }
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
  }, [account, checkNetwork, disconnectWallet, initializeWeb3, clearWeb3State, selectedNetwork]);

  // Continuous network monitoring when user is connected
  useEffect(() => {
    let networkCheckInterval: NodeJS.Timeout;

    if (account && typeof window.ethereum !== "undefined") {
      // Check network every 10 seconds when connected
      networkCheckInterval = setInterval(async () => {
        try {
          await checkNetwork();
        } catch {
          // Don't let periodic network check failures disrupt the interface
        }
      }, 10000);
    }

    return () => {
      if (networkCheckInterval) {
        clearInterval(networkCheckInterval);
      }
    };
  }, [account, checkNetwork, selectedNetwork]); // Add selectedNetwork to dependencies

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
              setShowTokenStaking(false);
            }
          } else {
            // No accounts connected, still check network for UI state
            await checkNetwork();
          }
        } catch (error: unknown) {
          console.error("Connection check failed:", error);
          await checkNetwork();
        }
      }
    };

    initialize();
  }, [checkNetwork]);

  // Update pending rewards every 30 seconds
  useEffect(() => {
    let rewardsUpdateInterval: NodeJS.Timeout;

    if (stakingContract && account && !wrongNetwork && typeof window.ethereum !== "undefined") {
      const updatePendingRewards = async () => {
        try {
          // Check if ethereum is available
          if (typeof window.ethereum === "undefined") {
            return;
          }

          // Create a fresh provider for each update to avoid stale references
          const freshProvider = new ethers.BrowserProvider(window.ethereum);

          // Create a fresh read-only contract instance to bypass any caching
          const freshContract = new ethers.Contract(
            FAET_STAKING_ADDRESS,
            ["function earned(address account) view returns (uint256)"],
            freshProvider
          );

          const earned = await freshContract.earned(account);
          const formattedEarned = ethers.formatEther(earned);
          setPendingRewards(formattedEarned);
        } catch {
          // Silently handle rewards update failures
        }
      };

      // Update immediately
      updatePendingRewards();

      // Then update every 2 seconds for real-time updates
      rewardsUpdateInterval = setInterval(updatePendingRewards, 2000);
    }

    return () => {
      if (rewardsUpdateInterval) {
        clearInterval(rewardsUpdateInterval);
      }
    };
  }, [stakingContract, account, wrongNetwork, FAET_STAKING_ADDRESS]);

  // Network validation effect
  useEffect(() => {
    const validateNetwork = () => {
      if (!currentChainId) {
        setWrongNetwork(false);
        return;
      }

      const currentNetworkConfig = getNetworkConfig(selectedNetwork);
      const expectedChainId = currentNetworkConfig.chainId;
      const expectedChainNumber = currentNetworkConfig.chainIdNumber;

      // Check both hex and decimal formats for reliability
      const isCorrectNetwork = currentChainId === expectedChainId || currentChainIdNumber === expectedChainNumber;

      setWrongNetwork(!isCorrectNetwork);
    };

    validateNetwork();
  }, [currentChainId, currentChainIdNumber, selectedNetwork]);

  // Only allow staking interface if connected to correct network
  const canAccessStaking = Boolean(
    account && !wrongNetwork && currentChainId
  );

  // Initialize Web3 when account and network are both correct
  useEffect(() => {
    const initWeb3IfReady = async () => {
      if (account && !wrongNetwork) {
        await initializeWeb3();
      }
    };

    initWeb3IfReady();
  }, [account, wrongNetwork, initializeWeb3]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);if (element) {
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
          {selectedNetwork === 'mainnet' ? 'FAET STAKING - MAINNET' : 'FAET STAKING - TESTNET'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeInOut", delay: 0.1 }}
          className="text-lg mb-6 max-w-3xl"
        >
          {selectedNetwork === 'mainnet'
            ? 'Stake your FAET tokens to earn real rewards on the Lisk mainnet. All transactions involve actual tokens and have real value. Connect your MetaMask wallet to get started with mainnet staking.'
            : 'Test the FAET staking system on the Lisk Sepolia testnet. This is a safe environment to test staking functionality with test tokens. Perfect for learning how the system works before mainnet.'
          }
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
            onSwitchNetwork={switchToCurrentNetwork}
            onGoToStaking={handleGoToStaking}
            onNetworkChange={handleNetworkChange}
          />
        )}

        {showTokenStaking && account && (
          <StakingInterface
            account={account!}
            selectedNetwork={selectedNetwork}
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
            totalStakeWeight={totalStakeWeight}
            topStakers={topStakers}
            stakingRanges={stakingRanges}
            onStakeAmountChange={setStakeAmount}
            onSelectedDaysChange={setSelectedDays}
            onStake={handleStake}
            onWithdraw={handleWithdraw}
            onClaimRewards={handleClaimRewards}
            onBackToOverview={() => {
              setShowTokenStaking(false);
              // Scroll back to top when returning to overview
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {!showTokenStaking && <StakingFeatures />}
      </div>
    </div>
  );
}