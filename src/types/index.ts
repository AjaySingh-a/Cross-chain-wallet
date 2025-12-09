export interface Chain {
  id: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  valueInUSD?: string;
  timestamp: number;
  type: 'sent' | 'received';
  status: 'pending' | 'confirmed' | 'failed';
  chainId: number;
  chainName: string;
  blockNumber?: number;
  gasUsed?: string;
  gasPrice?: string;
}

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export interface TransactionCache {
  data: Transaction[];
  timestamp: number;
  chainId: number;
}

export const SUPPORTED_CHAINS: Record<number, Chain> = {
  1: {
    id: 1,
    name: 'Ethereum',
    rpcUrl: import.meta.env.VITE_ALCHEMY_ETHEREUM || '',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  137: {
    id: 137,
    name: 'Polygon',
    rpcUrl: import.meta.env.VITE_ALCHEMY_POLYGON || '',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  42161: {
    id: 42161,
    name: 'Arbitrum',
    rpcUrl: import.meta.env.VITE_ALCHEMY_ARBITRUM || '',
    blockExplorer: 'https://arbiscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
};

export const CHAIN_IDS = Object.keys(SUPPORTED_CHAINS).map(Number);

