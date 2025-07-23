"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
      isMetaMask?: boolean;
      on?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

// Contract addresses on Lisk Sepolia
const FAET_TOKEN_ADDRESS = "0x80fD38fFDE3E77fAcE192Ea74fD510618C50f394";
const FAET_STAKING_ADDRESS = "0x3A70F607d7E6a0eEDB32B9743CabB1cB3D4844a3";

// Calculate multiplier based on days - linear from 1x to 20x over 730 days
const calculateMultiplier = (days: number): number => {
  if (days === 0) return 1.0;
  if (days >= 730) return 20.0;
  // Linear interpolation: 1 + (days * 19) / 730
  return 1 + (days * 19) / 730;
};

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
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(null);
  const [stakingContract, setStakingContract] = useState<ethers.Contract | null>(null);

  // Token/Staking state
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [stakedBalance, setStakedBalance] = useState<string>("0");
  const [pendingRewards, setPendingRewards] = useState<string>("0");
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<number>(0);
  const [userStakes, setUserStakes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>("");
  const [approvedAmount, setApprovedAmount] = useState<string>("0");
  const [approvalAmount, setApprovalAmount] = useState<string>("");
  const [totalRewardsFunded, setTotalRewardsFunded] = useState<string>("0");

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
    setSigner(null);
    setTokenContract(null);
    setStakingContract(null);
    setTokenBalance("0");
    setStakedBalance("0");
    setPendingRewards("0");
    setUserStakes([]);
    setApprovedAmount("0");
    setApprovalAmount("");
    setTotalRewardsFunded("0");
    setShowTokenStaking(false);
  };

  const checkNetwork = async (): Promise<boolean> => {
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
  };

  const switchToLiskSepolia = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: LISK_SEPOLIA_CHAIN_ID }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
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

  const initializeWeb3 = async () => {
    if (typeof window.ethereum !== "undefined" && account) {
      try {
        console.log("Initializing Web3 for account:", account);

        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);

        const web3Signer = await web3Provider.getSigner();
        const signerAddress = await web3Signer.getAddress();
        console.log("Signer address:", signerAddress);

        setSigner(web3Signer);

        const token = new ethers.Contract(
          FAET_TOKEN_ADDRESS,
          FAET_TOKEN_ABI,
          web3Signer,
        );
        const staking = new ethers.Contract(
          FAET_STAKING_ADDRESS,
          FAET_STAKING_ABI,
          web3Signer,
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
      } catch (error: any) {
        console.error("Error initializing Web3:", error?.message || error);
        clearWeb3State();
      }
    } else {
      console.log("Cannot initialize Web3: missing ethereum or account");
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
      } catch (error) {
        console.error("Error fetching token balance:", error);
        setTokenBalance("0");
      }

      // Get weighted balance (active staking weight)
      try {
        // Try getActiveWeight first since it's the actual current active weight
        const activeWeight = await staking.getActiveWeight(userAddress);
        setStakedBalance(ethers.formatEther(activeWeight));
        console.log("Successfully fetched active weight:", ethers.formatEther(activeWeight));
      } catch (error: any) {
        console.warn("Error fetching active weight:", error?.code || error?.message);
        // Try weightedBalances as fallback
        try {
          const weighted = await staking.weightedBalances(userAddress);
          setStakedBalance(ethers.formatEther(weighted));
          console.log("Successfully fetched weighted balance:", ethers.formatEther(weighted));
        } catch (fallbackError: any) {
          console.warn("Error fetching weighted balances:", fallbackError?.code || fallbackError?.message);
          setStakedBalance("0");
        }
      }

      // Get pending rewards with fallback handling
      try {
        const earned = await staking.earned(userAddress);
        setPendingRewards(ethers.formatEther(earned));
        console.log("Successfully fetched earnings:", ethers.formatEther(earned));
      } catch (error: any) {
        console.warn("Error fetching earnings (contract may not exist or wrong network):", error?.code || error?.message);
        setPendingRewards("0");
      }

      // Get allowance
      try {
        const allowance = await token.allowance(userAddress, FAET_STAKING_ADDRESS);
        setApprovedAmount(ethers.formatEther(allowance));
      } catch (error) {
        console.error("Error fetching allowance:", error);
        setApprovedAmount("0");
      }

      // Get total rewards funded
      try {
        const totalFunded = await staking.totalRewardsFunded();
        setTotalRewardsFunded(ethers.formatEther(totalFunded));
        console.log("Successfully fetched total rewards funded:", ethers.formatEther(totalFunded));
      } catch (error: any) {
        console.warn("Error fetching total rewards funded:", error?.code || error?.message);
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
      } catch (error: any) {
        console.warn("Error loading stakes (contract may not exist or wrong network):", error?.code || error?.message);
        setUserStakes([]);
      }
    } catch (error: any) {
      console.error("Critical error loading user data:", error?.message || error);
      if (error?.code === "BAD_DATA") {
        console.warn("Contract decode error - likely wrong network or contract not deployed");
      }
      // Set fallback values
      setTokenBalance("0");
      setStakedBalance("0");
      setPendingRewards("0");
      setApprovedAmount("0");
      setUserStakes([]);
      setTotalRewardsFunded("0");
    }
  };

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
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
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
    } catch (error: any) {
      console.error("Staking failed:", error);
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
    } catch (error: any) {
      console.error("Withdrawal failed:", error);
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
    } catch (error: any) {
      console.error("Claim failed:", error);
      
      // Handle specific error cases
      if (error?.reason === "Insufficient funded rewards" || 
          error?.message?.includes("Insufficient funded rewards")) {
        alert("❌ Claim Failed: The reward pool is currently empty. Please wait for the pool to be refunded by the administrators.");
      } else if (error?.reason === "No rewards" || 
                 error?.message?.includes("No rewards")) {
        alert("❌ Claim Failed: You have no rewards to claim at this time.");
      } else {
        alert(`❌ Claim Failed: ${error?.reason || error?.message || "Unknown error occurred"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!tokenContract || !approvalAmount) return;

    const networkOk = await checkNetwork();
    if (!networkOk) {
      console.error("Cannot approve: wrong network");
      return;
    }

    setIsLoading(true);
    setTxHash("");

    try {
      const amount = ethers.parseEther(approvalAmount);
      console.log("Approving tokens...");
      const approveTx = await tokenContract.approve(FAET_STAKING_ADDRESS, amount);
      setTxHash(approveTx.hash);
      await approveTx.wait();

      // Reload user data to update approved amount
      if (account && stakingContract) {
        await loadUserData(tokenContract, stakingContract, account);
      }
      setApprovalAmount("");
      console.log("Approval successful!");
    } catch (error: any) {
      console.error("Approval failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setWrongNetwork(false);
    setCurrentChainId(null);
    clearWeb3State();
  };

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
  }, [account]);

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
  }, [account]);

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
        } catch (error) {
          console.error("Error checking existing connection:", error);
          await checkNetwork();
        }
      }
    };

    initialize();
  }, []);

  // Update pending rewards every 30 seconds
  useEffect(() => {
    let rewardsUpdateInterval: NodeJS.Timeout;

    if (account && !wrongNetwork && stakingContract && canAccessStaking) {
      const updatePendingRewards = async () => {
        try {
          const earned = await stakingContract.earned(account);
          setPendingRewards(ethers.formatEther(earned));
        } catch (error) {
          console.warn("Error updating pending rewards:", error);
        }
      };

      // Update immediately
      updatePendingRewards();

      // Then update every 30 seconds
      rewardsUpdateInterval = setInterval(updatePendingRewards, 30000);
    }

    return () => {
      if (rewardsUpdateInterval) {
        clearInterval(rewardsUpdateInterval);
      }
    };
  }, [account, wrongNetwork, stakingContract, canAccessStaking]);

  // Initialize Web3 when account and network are both correct
  useEffect(() => {
    const initWeb3IfReady = async () => {
      if (account && !wrongNetwork && currentChainIdNumber === parseInt(LISK_SEPOLIA_CHAIN_ID, 16)) {
        console.log("Auto-initializing Web3 due to state change");
        await initializeWeb3();
      }
    };

    initWeb3IfReady();
  }, [account, wrongNetwork, currentChainIdNumber]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Only allow staking interface if connected to correct network
  const canAccessStaking = account && !wrongNetwork && currentChainIdNumber === parseInt(LISK_SEPOLIA_CHAIN_ID, 16) && selectedNetwork === 'testnet';

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
                onClick={() => setSelectedNetwork('mainnet')}
                disabled={true}
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 cursor-not-allowed"
              >
                Mainnet
              </button>
              <button
                onClick={() => setSelectedNetwork('testnet')}
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
          animate={{
            opacity: showTokenStaking ? 0 : 1,
            y: showTokenStaking ? -20 : 0,
            height: showTokenStaking ? 0 : "auto",
          }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
            delay: showTokenStaking ? 0 : 0.2,
          }}
          className={`bg-gray-900 p-8 rounded-lg border border-gray-700 overflow-hidden ${showTokenStaking ? "mb-0" : "mb-0"}`}
          style={{ display: showTokenStaking ? "none" : "block" }}
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
                    onClick={wrongNetwork ? switchToLiskSepolia : handleGoToStaking}
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
                onClick={disconnectWallet}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Disconnect Wallet
              </button>
            </div>
          )}
        </motion.div>

        {/* Token Staking Container - Only show on correct network */}
        {showTokenStaking && canAccessStaking && (
          <motion.div
            id="token-staking"
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="bg-gray-900 p-8 rounded-lg border border-gray-700 mt-6"
          >
            <h2 className="text-2xl font-nocturne-serif-bold mb-6">
              Token Staking (Testnet)
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-purple-400">
                  Available Balance
                </h3>
                <p className="text-3xl font-bold mb-2">
                  {parseFloat(tokenBalance).toFixed(2)} FAET
                </p>
                <p className="text-gray-400 text-sm">Your wallet balance</p>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-green-400">
                  Active Staking Weight
                </h3>
                <p className="text-3xl font-bold mb-2">
                  {parseFloat(stakedBalance).toFixed(2)} FAET
                </p>
                <p className="text-gray-400 text-sm">
                  {userStakes.length} active stakes
                </p>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-bold mb-4">Token Approval</h3>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">Current Approved Amount:</span>
                  <span className="text-lg font-bold text-green-400">
                    {parseFloat(approvedAmount).toFixed(2)} FAET
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  This is the amount the staking contract can spend on your behalf. You need approval before staking.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Amount to approve"
                      value={approvalAmount}
                      onChange={(e) => setApprovalAmount(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none h-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setApprovalAmount(tokenBalance)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded transition-colors"
                    >
                      MAX
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={
                        !approvalAmount ||
                        isLoading ||
                        wrongNetwork ||
                        parseFloat(approvalAmount) <= 0 ||
                        parseFloat(approvalAmount) > parseFloat(tokenBalance)
                      }
                      className={`font-bold py-2 px-6 rounded-lg transition-colors min-w-[100px] h-10 ${
                        !approvalAmount ||
                        isLoading ||
                        wrongNetwork ||
                        parseFloat(approvalAmount) <= 0 ||
                        parseFloat(approvalAmount) > parseFloat(tokenBalance)
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      {isLoading ? "Approving..." : "Approve"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-nocturne-serif-bold mb-4">Stake FAET Tokens</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Lock Duration: {selectedDays} days
                </label>
                <div className="mb-3">
                  <input
                    type="range"
                    min="0"
                    max="730"
                    step="1"
                    value={selectedDays}
                    onChange={(e) => setSelectedDays(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(selectedDays / 730) * 100}%, #374151 ${(selectedDays / 730) * 100}%, #374151 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0 days (1.00x)</span>
                    <span>180 days ({calculateMultiplier(180).toFixed(2)}x)</span>
                    <span>365 days ({calculateMultiplier(365).toFixed(2)}x)</span>
                    <span>730 days (20.00x)</span>
                  </div>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Multiplier:</span>
                    <span className="text-lg font-bold text-purple-400">
                      {calculateMultiplier(selectedDays).toFixed(2)}x
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-300">Lock Period:</span>
                    <span className="text-sm text-blue-400">
                      {selectedDays === 0 ? "No Lock" : `${selectedDays} days`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex justify-between">
                  <label className="block text-sm font-medium">
                    Amount to Stake
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.0"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none h-10"
                      />
                      <button
                        type="button"
                        onClick={() => setStakeAmount(tokenBalance)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded transition-colors"
                      >
                        MAX
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <button
                      onClick={handleStake}
                      disabled={
                        !stakeAmount ||
                        isLoading ||
                        wrongNetwork ||
                        parseFloat(stakeAmount) <= 0 ||
                        parseFloat(stakeAmount) > parseFloat(tokenBalance)
                      }
                      className={`font-bold py-2 px-6 rounded-lg transition-colors min-w-[140px] h-10 ${
                        !stakeAmount ||
                        isLoading ||
                        wrongNetwork ||
                        parseFloat(stakeAmount) <= 0 ||
                        parseFloat(stakeAmount) > parseFloat(tokenBalance)
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {isLoading ? "Processing..." : "Stake Tokens"}
                    </button>
                  </div>
                </div>

                <div className="flex justify-start">
                  <p className="text-gray-400 text-xs">
                    Available: {parseFloat(tokenBalance).toFixed(2)} FAET
                  </p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Reward rate: 1.0 FAET per block, 2-second blocks. Higher
                multipliers = more rewards!
              </p>

              {txHash && (
                <div className="mt-4 p-3 bg-blue-900 border border-blue-600 rounded-lg">
                  <p className="text-blue-300 text-sm">Transaction Hash:</p>
                  <a
                    href={`https://sepolia-blockscout.lisk.com/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm font-mono break-all"
                  >
                    {txHash}
                  </a>
                </div>
              )}
            </div>

            <div className="bg-gray-800 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-bold mb-4">Your Stakes</h3>

              {userStakes.length === 0 ? (
                <p className="text-gray-400">No active stakes found.</p>
              ) : (
                <div className="space-y-4">
                  {userStakes.map((stake, index) => (
                    <div key={index} className="bg-gray-700 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Amount</p>
                          <p className="font-bold">
                            {parseFloat(stake.amount).toFixed(2)} FAET
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Multiplier</p>
                          <p className="font-bold text-purple-400">
                            {stake.multiplier.toFixed(2)}x
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Status</p>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${stake.isUnlocked ? "bg-green-400" : "bg-red-400"}`}
                            ></div>
                            <p
                              className={`font-bold text-sm ${stake.isUnlocked ? "text-green-400" : "text-red-400"}`}
                            >
                              {stake.isUnlocked ? "Unlocked" : "Locked"}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Lock Info</p>
                          {stake.lockEndBlock === 0 ? (
                            <p className="font-bold text-green-400 text-sm">
                              No Lock
                            </p>
                          ) : stake.isUnlocked ? (
                            <p className="font-bold text-green-400 text-sm">
                              Ready
                            </p>
                          ) : (
                            <div>
                              <p className="font-bold text-red-400 text-sm">
                                ~{Math.ceil(stake.blocksRemaining / 43200)} days left
                              </p>
                              <p className="text-xs text-gray-400">
                                ({stake.blocksRemaining.toLocaleString()} blocks)
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleWithdraw(stake.index)}
                            disabled={
                              !stake.isUnlocked || isLoading || wrongNetwork
                            }
                            className={`font-bold py-2 px-4 rounded-lg text-sm transition-colors min-w-[100px] ${
                              !stake.isUnlocked || isLoading || wrongNetwork
                                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700 text-white"
                            }`}
                          >
                            {isLoading
                              ? "Processing..."
                              : stake.isUnlocked
                                ? "Withdraw"
                                : "Locked"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-yellow-400">
                Rewards
              </h3>
              
              {/* Reward Pool Status */}
              <div className="mb-4 p-3 rounded-lg bg-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Reward Pool:</span>
                  <span className={`text-sm font-bold ${
                    parseFloat(totalRewardsFunded) > 0 ? "text-green-400" : "text-red-400"
                  }`}>
                    {parseFloat(totalRewardsFunded).toFixed(2)} FAET
                  </span>
                </div>
                {parseFloat(totalRewardsFunded) === 0 && (
                  <p className="text-xs text-red-400 mt-1">
                    ⚠️ Reward pool is empty. Claims are not possible until refunded.
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-400">Pending Rewards</p>
                  <p className="text-2xl font-bold">
                    {parseFloat(pendingRewards).toFixed(6)} FAET
                  </p>
                </div>
                <button
                  onClick={handleClaimRewards}
                  disabled={
                    parseFloat(pendingRewards) === 0 ||
                    parseFloat(totalRewardsFunded) === 0 ||
                    isLoading ||
                    wrongNetwork
                  }
                  className={`font-bold py-2 px-6 rounded-lg transition-colors ${
                    parseFloat(pendingRewards) === 0 ||
                    parseFloat(totalRewardsFunded) === 0 ||
                    isLoading ||
                    wrongNetwork
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-yellow-600 hover:bg-yellow-700 text-white"
                  }`}
                  title={
                    parseFloat(totalRewardsFunded) === 0 
                      ? "Reward pool is empty - cannot claim rewards"
                      : parseFloat(pendingRewards) === 0
                        ? "No rewards available to claim"
                        : "Claim your pending rewards"
                  }
                >
                  {isLoading ? "Processing..." : "Claim Rewards"}
                </button>
              </div>
              <p className="text-gray-400 text-sm">
                Rate: 1.0 FAET per block (varies with multipliers)
              </p>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-700 p-3 rounded">
                  <p className="text-gray-400">Contract Address</p>
                  <a
                    href={`https://sepolia-blockscout.lisk.com/address/${FAET_STAKING_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 font-mono text-xs break-all"
                  >
                    {FAET_STAKING_ADDRESS}
                  </a>
                </div>
                <div className="bg-gray-700 p-3 rounded">
                  <p className="text-gray-400">Token Address</p>
                  <a
                    href={`https://sepolia-blockscout.lisk.com/address/${FAET_TOKEN_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 font-mono text-xs break-all"
                  >
                    {FAET_TOKEN_ADDRESS}
                  </a>
                </div>
              </div>
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
            <h3 className="text-xl font-bold mb-4 text-purple-400">
              Staking Rewards
            </h3>
            <p className="text-gray-300">
              Earn ERC-20 tokens as rewards for staking your NFTs and
              participating in the ecosystem.
            </p>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-blue-400">
              Exclusive Access
            </h3>
            <p className="text-gray-300">
              Unlock special in-game items, exclusive content, and early access
              to future NFT drops.
            </p>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-green-400">
              Platform Benefits
            </h3>
            <p className="text-gray-300">
              Gain voting rights, reduced fees, and priority access to new
              features and games.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}