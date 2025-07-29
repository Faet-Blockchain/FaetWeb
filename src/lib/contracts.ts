
// Contract configuration for different networks
export type ContractAddresses = {
  CHARACTER_NFT: string;
  FOUNDERS_PASS: string;
  FAET_TOKEN: string;
};

export const getContractAddresses = (selectedNetwork: 'testnet' | 'mainnet'): ContractAddresses => {
  if (selectedNetwork === 'mainnet') {
    return {
      CHARACTER_NFT: '0x71f671c470488C02f1e4a97278b8241EAFA476a2',
      FOUNDERS_PASS: '0xEA5b2Fa311d580B935487295Ac244D7F319be320',
      FAET_TOKEN: '0x885C42A8aAD3e0AB478fB9Da6Bf9eAB81Ab8c36E'
    };
  } else {
    // Testnet addresses
    return {
      CHARACTER_NFT: '0xB37E9A6Df0887663fe0b4Cc9Ba19F8FC0DE18e12',
      FOUNDERS_PASS: '0x9AcB6e75D9c94eEb9320b35758cF0B21e4FF7a5D',
      FAET_TOKEN: '0x80fD38fFDE3E77fAcE192Ea74fD510618C50f394'
    };
  }
};

export const getExpectedChainId = (selectedNetwork: 'testnet' | 'mainnet'): string => {
  return selectedNetwork === 'mainnet' ? '0x46f' : '0x106a';
};
