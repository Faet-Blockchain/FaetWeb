// Network configuration for staking
export type NetworkType = 'testnet' | 'mainnet';

export interface NetworkConfig {
  chainId: string;
  chainIdNumber: number;
  name: string;
  rpcUrl: string;
  blockExplorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  contracts: {
    token: string;
    staking: string;
  };
}

export const NETWORK_CONFIGS: Record<NetworkType, NetworkConfig> = {
  testnet: {
    chainId: '0x106a',
    chainIdNumber: 4202,
    name: 'Lisk Sepolia Testnet',
    rpcUrl: 'https://rpc.sepolia-api.lisk.com',
    blockExplorerUrl: 'https://sepolia-blockscout.lisk.com',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    contracts: {
      token: '0x80fD38fFDE3E77fAcE192Ea74fD510618C50f394',
      staking: '0x84B7F164cbAEdb17E98B5EA2512e6c41121E8472'
    }
  },
  mainnet: {
    chainId: '0x46f', // Lisk mainnet chain ID (1135)
    chainIdNumber: 1135,
    name: 'Lisk Mainnet',
    rpcUrl: 'https://rpc.api.lisk.com',
    blockExplorerUrl: 'https://blockscout.lisk.com',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    contracts: {
      token: '0xdF92bA28D17329a7284A5eC230967768D4cb7A89',
      staking: '0xFbb61c8C8aA305F3ced88cA7D6E7859126Dc3B83'
    }
  }
};

export const getNetworkConfig = (network: NetworkType): NetworkConfig => {
  return NETWORK_CONFIGS[network];
};

export const isMainnet = (network: NetworkType): boolean => {
  return network === 'mainnet';
};