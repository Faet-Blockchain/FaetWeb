
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
const FAET_STAKING_ADDRESS = "0x5189477536B1E476C4025c156526f7e37438BD90";

// Lock duration options (in blocks)
const LOCK_DURATIONS = {
  NO_LOCK: { blocks: 0, multiplier: 1, label: "No Lock" },
  SIX_MONTHS: { blocks: 15768000, multiplier: 20, label: "1 Year" },
  EIGHTEEN_MONTHS: { blocks: 47304000, multiplier: 30, label: "3 Years" },
  THREE_YEARS: { blocks: 94608000, multiplier: 50, label: "6 Years" },
};

// Simplified ABI for the functions we need
const FAET_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

const FAET_STAKING_ABI = [
  "function stake(uint256 amount, uint256 lockDuration)",
  "function withdraw(uint256 stakeIndex)",
  "function getReward()",
  "function earned(address account) view returns (uint256)",
  "function getStakeCount(address user) view returns (uint256)",
  "function getStakeDetails(address user, uint256 stakeIndex) view returns (uint256 amount, uint256 weightedAmount, uint256 multiplier, uint256 lockEndBlock)",
  "function weightedBalances(address account) view returns (uint256)",
  "function rewards(address account) view returns (uint256)",
];

export default function StakingPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [showTokenStaking, setShowTokenStaking] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<'testnet' | 'mainnet'>('testnet');
  const [currentChainId, setCurrentChainId] = useState<string | null>(null);

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
  const [selectedLockDuration, setSelectedLockDuration] = useState<number>(0);
  const [userStakes, setUserStakes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>("");

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
    setShowTokenStaking(false);
  };

  const checkNetwork = async (): Promise<boolean> => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const chainId = (await window.ethereum.request({
          method: "eth_chainId",
        })) as string;

        console.log(`Current chain ID: ${chainId}, Required: ${LISK_SEPOLIA_CHAIN_ID}`);
        setCurrentChainId(chainId);
        
        // Normalize both hex values to lowercase for comparison
        const normalizedChainId = chainId.toLowerCase();
        const normalizedRequiredChainId = LISK_SEPOLIA_CHAIN_ID.toLowerCase();
        
        const isCorrectNetwork = normalizedChainId === normalizedRequiredChainId;
        setWrongNetwork(!isCorrectNetwork);
        
        if (!isCorrectNetwork) {
          clearWeb3State();
          console.log("Wrong network detected, clearing state");
        }
        
        return isCorrectNetwork;
      } catch (error) {
        console.error("Error checking network:", error);
        setWrongNetwork(true);
        setCurrentChainId(null);
        clearWeb3State();
        return false;
      }
    }
    setWrongNetwork(true);
    setCurrentChainId(null);
    clearWeb3State();
    return false;
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
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);

        const web3Signer = await web3Provider.getSigner();
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

        await loadUserData(token, staking, account);
      } catch (error) {
        console.error("Error initializing Web3:", error);
        clearWeb3State();
      }
    }
  };

  const loadUserData = async (
    token: ethers.Contract,
    staking: ethers.Contract,
    userAddress: string,
  ) => {
    try {
      const currentBlock = (await provider?.getBlockNumber()) || 0;

      const balance = await token.balanceOf(userAddress);
      setTokenBalance(ethers.formatEther(balance));

      const weighted = await staking.weightedBalances(userAddress);
      setStakedBalance(ethers.formatEther(weighted));

      const earned = await staking.earned(userAddress);
      setPendingRewards(ethers.formatEther(earned));

      const stakeCount = await staking.getStakeCount(userAddress);
      const stakes = [];
      for (let i = 0; i < Number(stakeCount); i++) {
        const stakeDetails = await staking.getStakeDetails(userAddress, i);
        const lockEndBlock = Number(stakeDetails.lockEndBlock);
        const isUnlocked = lockEndBlock === 0 || currentBlock >= lockEndBlock;

        stakes.push({
          index: i,
          amount: ethers.formatEther(stakeDetails.amount),
          weightedAmount: ethers.formatEther(stakeDetails.weightedAmount),
          multiplier: Number(stakeDetails.multiplier),
          lockEndBlock: lockEndBlock,
          isUnlocked: isUnlocked,
          blocksRemaining: isUnlocked ? 0 : Math.max(0, lockEndBlock - currentBlock),
        });
      }
      setUserStakes(stakes);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const connectMetaMask = async () => {
    if (typeof window.ethereum !== "undefined") {
      setIsConnecting(true);
      try {
        const accounts = (await window.ethereum.request({
          method: "eth_requestAccounts",
        })) as string[];
        
        setAccount(accounts[0]);
        
        // Immediate network check after connection
        const networkOk = await checkNetwork();
        if (!networkOk) {
          console.log("Connected to wrong network, will not initialize Web3");
          alert("You are connected to the wrong network. Please switch to Lisk Sepolia testnet to access staking features.");
        }
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("MetaMask is not installed. Please install MetaMask to continue.");
    }
  };

  const handleStake = async () => {
    if (!tokenContract || !stakingContract || !stakeAmount) return;

    const networkOk = await checkNetwork();
    if (!networkOk) {
      alert("Please switch to Lisk Sepolia testnet to stake tokens.");
      return;
    }

    setIsLoading(true);
    setTxHash("");

    try {
      const amount = ethers.parseEther(stakeAmount);

      const balance = await tokenContract.balanceOf(account);
      if (balance < amount) {
        alert("Insufficient FAET token balance.");
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
      const stakeTx = await stakingContract.stake(amount, selectedLockDuration);
      setTxHash(stakeTx.hash);
      await stakeTx.wait();

      if (account) {
        await loadUserData(tokenContract, stakingContract, account);
      }
      setStakeAmount("");
      console.log("Staking successful!");
    } catch (error: any) {
      console.error("Staking failed:", error);
      alert(`Staking failed: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (stakeIndex: number) => {
    if (!stakingContract) return;

    const networkOk = await checkNetwork();
    if (!networkOk) {
      alert("Please switch to Lisk Sepolia testnet to withdraw tokens.");
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
      alert(`Withdrawal failed: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!stakingContract) return;

    const networkOk = await checkNetwork();
    if (!networkOk) {
      alert("Please switch to Lisk Sepolia testnet to claim rewards.");
      return;
    }

    setIsLoading(true);

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
      alert(`Claim failed: ${error.message || error}`);
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
        console.log("Chain changed to:", chainId);
        setCurrentChainId(chainId);
        
        // Normalize both hex values to lowercase for comparison
        const normalizedChainId = chainId.toLowerCase();
        const normalizedRequiredChainId = LISK_SEPOLIA_CHAIN_ID.toLowerCase();
        
        const isCorrectNetwork = normalizedChainId === normalizedRequiredChainId;
        setWrongNetwork(!isCorrectNetwork);
        
        if (!isCorrectNetwork) {
          console.log("Wrong network detected, clearing state");
          clearWeb3State();
        } else if (account) {
          console.log("Correct network detected, reinitializing Web3");
          setTimeout(async () => {
            await initializeWeb3();
          }, 1000);
        }
      };

      const handleAccountsChanged = async (accounts: string[]) => {
        console.log("Accounts changed:", accounts);
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
          const networkOk = await checkNetwork();
          if (!networkOk) {
            clearWeb3State();
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

  // Initialize on mount and when account changes
  useEffect(() => {
    const initialize = async () => {
      await checkNetwork();
      
      // Check if already connected
      if (typeof window.ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" }) as string[];
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        } catch (error) {
          console.error("Error checking existing connection:", error);
        }
      }
    };
    
    initialize();
  }, []);

  // Initialize Web3 when account and network are both correct
  useEffect(() => {
    const initWeb3IfReady = async () => {
      if (account && !wrongNetwork && currentChainId === LISK_SEPOLIA_CHAIN_ID) {
        await initializeWeb3();
      }
    };
    
    initWeb3IfReady();
  }, [account, wrongNetwork, currentChainId]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Only allow staking interface if connected to correct network
  const canAccessStaking = account && !wrongNetwork && currentChainId?.toLowerCase() === LISK_SEPOLIA_CHAIN_ID.toLowerCase() && selectedNetwork === 'testnet';

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeInOut" }}
          className="text-5xl md:text-7xl font-nocturne-serif-bold mb-8"
        >
          STAKING {selectedNetwork === 'testnet' ? '(TESTNET)' : '(MAINNET)'}
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

              {wrongNetwork && (
                <div className="bg-red-900 border border-red-600 rounded-lg p-4 mb-6">
                  <p className="text-red-300 mb-2">⚠️ Wrong Network</p>
                  <p className="text-white mb-2">
                    Please switch to Lisk Sepolia Testnet to access staking features.
                  </p>
                  <p className="text-gray-300 text-sm mb-4">
                    Current: {currentChainId || 'Unknown'} | Required: {LISK_SEPOLIA_CHAIN_ID}
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
                  <p className="text-gray-300 mb-4">
                    Stake your FAET tokens to earn rewards
                  </p>
                  <button
                    onClick={wrongNetwork ? switchToLiskSepolia : handleGoToStaking}
                    disabled={!account || (!canAccessStaking && !wrongNetwork)}
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
                  Weighted Staked
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
              <h3 className="text-xl font-bold mb-4">Stake FAET Tokens</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Lock Duration
                </label>
                <select
                  value={selectedLockDuration}
                  onChange={(e) =>
                    setSelectedLockDuration(parseInt(e.target.value))
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  {Object.entries(LOCK_DURATIONS).map(([key, duration]) => (
                    <option key={key} value={duration.blocks}>
                      {duration.label} - {duration.multiplier}x Multiplier
                    </option>
                  ))}
                </select>
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
                            {stake.multiplier}x
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
                            <p className="font-bold text-red-400 text-sm">
                              ~{stake.blocksRemaining.toLocaleString()} blocks
                            </p>
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
                    isLoading ||
                    wrongNetwork
                  }
                  className={`font-bold py-2 px-6 rounded-lg transition-colors ${
                    parseFloat(pendingRewards) === 0 ||
                    isLoading ||
                    wrongNetwork
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-yellow-600 hover:bg-yellow-700 text-white"
                  }`}
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
