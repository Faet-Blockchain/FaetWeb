"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ethers } from "ethers";
import WalletConnection from "@/components/staking/WalletConnection";
import StakingInterface from "@/components/staking/StakingInterface";
import StakingFeatures from "@/components/staking/StakingFeatures";
import { getNetworkConfig } from "@/lib/networks";
import ErrorBoundary from "@/components/ErrorBoundary";

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

// Function to calculate the correct event topic hash
const calculateEventTopic = (signature: string): string => {
  if (typeof window !== 'undefined' && (window as typeof window & { ethereum?: unknown }).ethereum) {
    try {
      // Use ethers directly since it's already imported at the top
      return ethers.id(signature);
    } catch (error) {
      console.warn('Could not calculate event topic:', error);
    }
  }
  // Fallback to pre-calculated hash
  return "0xd8138f8a3f377c5259ca548e70e4c2de94f129f5a11036a15b69513cba2b426a";
};

// Try different possible event signatures based on the ABI
const possibleStakedSignatures = [
  "Staked(address,uint256,uint256,uint256)",
  "Staked(address,uint256,uint256)",
  "Staked(address,uint256)",
];

const STAKED_EVENT_TOPIC = calculateEventTopic(possibleStakedSignatures[0]);

// Debug: Log the event signatures and their hashes for verification
console.log(`🔍 Testing event signatures:`);
possibleStakedSignatures.forEach((sig, index) => {
  const hash = calculateEventTopic(sig);
  console.log(`  ${index + 1}. "${sig}" => ${hash}`);
});

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
    if (typeof window.ethereum !== "undefined" && window.ethereum.request) {
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
    if (typeof window.ethereum !== "undefined" && window.ethereum.request) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: REQUIRED_CHAIN_ID }],
        });
      } catch (switchError: unknown) {
        if ((switchError as { code?: number })?.code === 4902) {
          try {
            if (window.ethereum?.request) {
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
            }
          } catch (addError) {
            console.error("Error adding network:", addError);
          }
        } else {
          console.error("Error switching network:", switchError);
        }
      }
    }
  };

  const loadTopStakersData = useCallback(async (staking: ethers.Contract) => {
    try {
      // Set initial loading state
      setTopStakers([]);
      setStakingRanges([]);

      // Get network configuration for API URL
      const networkConfig = getNetworkConfig(selectedNetwork);
      const baseUrl = selectedNetwork === 'mainnet'
        ? 'https://blockscout.lisk.com/api'
        : 'https://sepolia-blockscout.lisk.com/api';

      // Get staking contract address
      const stakingAddress = networkConfig.contracts.staking;

      console.log(`🔍 Fetching staker data from Blockscout API for contract: ${stakingAddress}`);

      // First, verify the contract exists and has code
      try {
        const contractCheckUrl = `${baseUrl}?module=contract&action=getabi&address=${stakingAddress}`;
        console.log(`🔍 Checking if contract exists: ${contractCheckUrl}`);

        const contractResponse = await fetch(contractCheckUrl);
        const contractData = await contractResponse.json();
        console.log(`📋 Contract check response:`, {
          status: contractData.status,
          message: contractData.message,
          hasABI: contractData.result && contractData.result !== 'Contract source code not verified'
        });

        if (contractData.status !== "1") {
          console.warn(`⚠️ Contract may not exist or be verified at address: ${stakingAddress}`);
        }
      } catch (contractError) {
        console.warn(`⚠️ Failed to check contract existence:`, contractError);
      }

      // First, try to fetch ANY logs from this contract to see if it has any activity
      try {
        const anyLogsUrl = `${baseUrl}?module=logs&action=getLogs&address=${stakingAddress}&fromBlock=0&toBlock=latest&page=1&offset=100`;
        console.log(`🔍 Checking for any logs from contract: ${anyLogsUrl}`);

        const anyLogsResponse = await fetch(anyLogsUrl);
        const anyLogsData = await anyLogsResponse.json();
        console.log(`📋 Any logs check:`, {
          status: anyLogsData.status,
          message: anyLogsData.message,
          hasResults: anyLogsData.result && Array.isArray(anyLogsData.result),
          resultCount: Array.isArray(anyLogsData.result) ? anyLogsData.result.length : 0
        });

        if (anyLogsData.result && Array.isArray(anyLogsData.result) && anyLogsData.result.length > 0) {
          console.log(`🔍 Sample log topics from contract:`, anyLogsData.result.slice(0, 10).map(log => ({
            topics: log.topics,
            data: log.data
          })));

          // Check if any of the logs match our expected Staked event pattern
          const stakedLogs = anyLogsData.result.filter(log =>
            log.topics && log.topics.length >= 2 &&
            log.topics[0] === STAKED_EVENT_TOPIC
          );
          console.log(`🔍 Found ${stakedLogs.length} logs matching our Staked topic`);

          // Show all unique topic[0] values to understand what events are actually being emitted
          const uniqueTopics = [...new Set(anyLogsData.result.map(log => log.topics?.[0]).filter(Boolean))];
          console.log(`🔍 All unique event topics in contract:`, uniqueTopics);
        }
      } catch (anyLogsError) {
        console.warn(`⚠️ Failed to check for any logs:`, anyLogsError);
      }

      // First, try to identify the correct Staked event signature by checking logs
      let correctStakedTopic = STAKED_EVENT_TOPIC;

      // If we have sample logs, try to find the Staked event topic
      try {
        const sampleLogsResponse = await fetch(`${baseUrl}?module=logs&action=getLogs&address=${stakingAddress}&fromBlock=0&toBlock=latest&page=1&offset=20`);
        if (sampleLogsResponse.ok) {
          const sampleLogsData = await sampleLogsResponse.json();
          if (sampleLogsData.result && Array.isArray(sampleLogsData.result)) {
            // Look for logs that might be Staked events (should have at least 2 topics: event signature + user address)
            const possibleStakedLogs = sampleLogsData.result.filter(log =>
              log.topics && log.topics.length >= 2
            );

            if (possibleStakedLogs.length > 0) {
              // Try each possible signature
              for (let i = 0; i < possibleStakedSignatures.length; i++) {
                const testTopic = calculateEventTopic(possibleStakedSignatures[i]);
                const matchingLogs = possibleStakedLogs.filter(log => log.topics[0] === testTopic);

                if (matchingLogs.length > 0) {
                  console.log(`✅ Found matching event signature: "${possibleStakedSignatures[i]}" with ${matchingLogs.length} logs`);
                  correctStakedTopic = testTopic;
                  break;
                }
              }
            }
          }
        }
      } catch (error) {
        console.warn('Could not determine correct event signature:', error);
      }

      console.log(`🎯 Using event topic: ${correctStakedTopic}`);

      // Fetch all Staked events from Blockscout API
      const uniqueStakers = new Set<string>();
      let page = 1;
      const pageSize = 10000; // Increase page size for efficiency
      let hasMoreData = true;
      let totalEvents = 0;

      while (hasMoreData) {
        try {
          // Blockscout API requires fromBlock and toBlock parameters
          // Use a wide range to get all events - from block 0 to latest
          const fromBlock = 0;
          const toBlock = 'latest';

          // Build URL with required parameters
          const url = `${baseUrl}?module=logs&action=getLogs&address=${stakingAddress}&topic0=${correctStakedTopic}&fromBlock=${fromBlock}&toBlock=${toBlock}&page=${page}&offset=${pageSize}&sort=desc`;

          console.log(`🔍 Fetching events from: ${url}`);
          console.log(`📊 Request details:`, {
            baseUrl,
            stakingAddress,
            eventTopic: correctStakedTopic,
            page,
            pageSize
          });

          const response = await fetch(url);
          console.log(`▋ Response status: ${response.status} ${response.statusText}`);

          if (!response.ok) {
            console.warn(`HTTP error ${response.status} on page ${page}`);
            const errorText = await response.text();
            console.warn(`Error response body:`, errorText);
            break;
          }

          const data = await response.json();
          console.log(`📋 API Response:`, {
            status: data.status,
            message: data.message,
            resultType: Array.isArray(data.result) ? 'array' : typeof data.result,
            resultLength: Array.isArray(data.result) ? data.result.length : 'N/A',
            fullResponse: data
          });

          if (data.status === "1" && data.result && Array.isArray(data.result)) {
            const eventsCount = data.result.length;
            totalEvents += eventsCount;
            console.log(`Page ${page}: ${eventsCount} events (total: ${totalEvents})`);

            for (const log of data.result) {
              if (log.topics && log.topics.length > 1) {
                // Extract user address from indexed topic (topic[1] is the user address)
                // Remove '0x' prefix and pad to get the last 40 characters (20 bytes = address)
                const userAddress = '0x' + log.topics[1].slice(-40).toLowerCase();
                if (userAddress && userAddress !== '0x0000000000000000000000000000000000000000') {
                  uniqueStakers.add(userAddress);
                }
              }
            }

            // Check if we have more data - if less than pageSize, we're done
            if (eventsCount < pageSize) {
              hasMoreData = false;
            } else {
              page++;
              // Add small delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          } else {
            if (data.message && data.message.includes("No records found")) {
              console.log(`📭 No more events found (page ${page})`);
            } else if (data.message && data.message.includes("No logs found")) {
              console.log(`🔍 No logs found for this contract and topic combination`);
              console.log(`🧐 Debug info:`, {
                contractExists: 'Verified - has 136+ logs total',
                topicHash: correctStakedTopic,
                possibleSignatures: possibleStakedSignatures
              });
            } else {
              console.log(`❌ API error on page ${page}:`, data.message || 'Unknown error');
              console.log(`🔍 Full error response:`, data);
            }
            hasMoreData = false;
          }
        } catch (error) {
          console.warn(`Failed to fetch page ${page}:`, error);
          // Try one more time before giving up
          if (page === 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          hasMoreData = false;
        }
      }

      console.log(`Total unique stakers found: ${uniqueStakers.size}`);

      // Calculate current active weights and raw amounts for each staker
      const stakersWithWeights: Array<{ address: string; weight: string; rawAmount: string }> = [];
      const stakersList = Array.from(uniqueStakers).filter(addr => addr && addr !== '');

      console.log(`Processing stake data for ${stakersList.length} unique stakers...`);

      // Process stakers in smaller batches to avoid overwhelming the RPC
      const batchSize = 50;
      for (let i = 0; i < stakersList.length; i += batchSize) {
        const batch = stakersList.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(stakersList.length/batchSize)}`);

        // Process batch in parallel but with limited concurrency
        const batchPromises = batch.map(async (staker) => {
          try {
            // Get weighted amount (for rewards calculation) and stake count in parallel
            const [activeWeight, stakeCount] = await Promise.all([
              staking.weightedBalances(staker),
              staking.getStakeCount(staker)
            ]);

            const weightInEther = ethers.formatEther(activeWeight);

            // Get raw stake amount using getAllStakeViews if available, fallback to individual calls
            let totalRawAmount = BigInt(0);
            try {
              // Try the more efficient getAllStakeViews first (if contract supports it)
              const allStakes = await staking.getAllStakeViews(staker);
              for (const stake of allStakes) {
                totalRawAmount += BigInt(stake.amount.toString());
              }
            } catch {
              // Fallback to individual stake calls
              const stakeCountNumber = Number(stakeCount);
              for (let j = 0; j < stakeCountNumber; j++) {
                try {
                  const stakeView = await staking.getStakeView(staker, j);
                  totalRawAmount += BigInt(stakeView[0].toString());
                } catch {
                  // Skip failed individual stake reads
                }
              }
            }

            const rawAmountInEther = ethers.formatEther(totalRawAmount);

            // Include stakers with either weighted amount or raw amount > 0
            if (parseFloat(weightInEther) > 0 || parseFloat(rawAmountInEther) > 0) {
              return {
                address: staker,
                weight: weightInEther,
                rawAmount: rawAmountInEther
              };
            }
          } catch {
            // Skip failed staker processing
          }
          return null;
        });

        // Wait for batch to complete
        const batchResults = await Promise.all(batchPromises);
        const validResults = batchResults.filter(result => result !== null);
        stakersWithWeights.push(...validResults);

        // Small delay between batches to avoid overwhelming the RPC
        if (i + batchSize < stakersList.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      // Sort by weight (highest first) for the main topStakers array
      stakersWithWeights.sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));

      // Calculate total stake weight from all stakers
      const totalNetworkWeight = stakersWithWeights.reduce((sum, staker) => {
        return sum + parseFloat(staker.weight);
      }, 0);

      setTotalStakeWeight(totalNetworkWeight.toString());
      // Pass ALL stakers data, not just top 10 - RewardsSection will handle the grouping
      setTopStakers(stakersWithWeights);


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
      setStakingRanges(stakingRangesData);

    } catch {
      console.error("Failed to load staking data:");

      // Set empty data as fallback
      setTopStakers([]);
      setStakingRanges([]);
    }
  }, [selectedNetwork]);

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

      // Calculate active staking weight from all stakes (locked and unlocked)
      let totalActiveWeight = BigInt(0);
      try {
        const stakeCount = await staking.getStakeCount(userAddress);
        const stakeCountNumber = Number(stakeCount);

        if (stakeCountNumber > 0) {
          for (let i = 0; i < stakeCountNumber; i++) {
            try {
              const stakeView = await staking.getStakeView(userAddress, i);
              const weightedAmount = stakeView[1]; // weightedAmount is at index 1

              // Count all stakes (both locked and unlocked)
              totalActiveWeight += BigInt(weightedAmount.toString());
            } catch {
              // Skip failed individual stake reads
            }
          }
        }

        setStakedBalance(ethers.formatEther(totalActiveWeight));
      } catch {
        // Fallback: use the contract's weightedBalances which includes all stakes
        try {
          const weightedBalance = await staking.weightedBalances(userAddress);
          setStakedBalance(ethers.formatEther(weightedBalance));
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
    if (typeof window.ethereum !== "undefined" && window.ethereum.request) {
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
        const approveTx = await tokenContract.approve(FAET_STAKING_ADDRESS, amount);
        await approveTx.wait();
      }

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
        // User cancelled transaction - no action needed
      } else if ((error as { code?: number })?.code === -32002) {
        // Request already pending in MetaMask
      } else if ((error as { reason?: string })?.reason === "Insufficient funded rewards") {
        console.error("Staking failed: Contract has insufficient rewards");
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
    setTxHash("");

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
        // User cancelled transaction
      } else if ((error as { code?: number })?.code === -32002) {
        // Request already pending in MetaMask
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
        // User cancelled transaction - no action needed
      } else if ((error as { code?: number })?.code === -32002) {
        // Request already pending in MetaMask
      } else if ((error as { reason?: string })?.reason === "Insufficient funded rewards" ||
                 (error as { message?: string })?.message?.includes("Insufficient funded rewards")) {
        alert("❌ Claim Failed: The reward pool is currently empty. Please wait for the pool to be refunded by the administrators.");
      } else if ((error as { reason?: string })?.reason === "No rewards" ||
                 (error as { message?: string })?.message?.includes("No rewards")) {
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
      const handleChainChanged = async () => {
        // Add delay to ensure wallet state is fully updated
        setTimeout(async () => {
          // Force fresh read from wallet instead of using event data
          let actualChainId;
          try {
            if (window.ethereum?.request) {
              actualChainId = (await window.ethereum.request({
                method: "eth_chainId",
              })) as string;
            } else {
              console.error("Error reading chain ID: window.ethereum not available");
              return;
            }
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
      if (typeof window.ethereum !== "undefined" && window.ethereum.request) {
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
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}