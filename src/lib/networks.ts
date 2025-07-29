
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
      token: '0x7A1618aac5bEBa6c87fA7c9C91BDA0Dc7A68D5c9',
      staking: '0x4Ded6C5b3D2A5B8f8d9F8e5B0d8E7A2C3F4B5D6E'
    }
  },
  mainnet: {
    chainId: '0x46f', // Lisk mainnet chain ID (1135)
    chainIdNumber: 1135,
    name: 'Lisk Mainnet',
    rpcUrl: 'https://rpc.api.lisk.com',
    blockExplorerUrl: 'https://blockscout.lisk.com',
    nativeCurrency: {
      name: 'Lisk',
      symbol: 'LSK',
      decimals: 18,
    },
    contracts: {
      // Using testnet addresses as placeholders for now
      token: '0x7A1618aac5bEBa6c87fA7c9C91BDA0Dc7A68D5c9',
      staking: '0x4Ded6C5b3D2A5B8f8d9F8e5B0d8E7A2C3F4B5D6E'
    }
  }
};

export const getNetworkConfig = (network: NetworkType): NetworkConfig => {
  return NETWORK_CONFIGS[network];
};

export const isMainnet = (network: NetworkType): boolean => {
  return network === 'mainnet';
};
