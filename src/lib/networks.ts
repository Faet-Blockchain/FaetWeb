
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
      token: '0x885C42A8aAD3e0AB478fB9Da6Bf9eAB81Ab8c36E',
      staking: '0x16DB31A6c553dC056b87Af221383ADd83FD6F90C'
    }
  }
};

export const getNetworkConfig = (network: NetworkType): NetworkConfig => {
  return NETWORK_CONFIGS[network];
};

export const isMainnet = (network: NetworkType): boolean => {
  return network === 'mainnet';
};
