import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { WalletState, SUPPORTED_CHAINS } from '../types';
import { WalletError } from '../utils/errors';

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchChain: (chainId: number) => Promise<void>;
  provider: ethers.providers.Web3Provider | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);

  const checkConnection = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      return;
    }

    try {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await web3Provider.listAccounts();
      const network = await web3Provider.getNetwork();

      if (accounts.length > 0) {
        setState({
          address: accounts[0],
          chainId: network.chainId,
          isConnected: true,
          isConnecting: false,
          error: null,
        });
        setProvider(web3Provider);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  }, []);

  useEffect(() => {
    checkConnection();

    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setState(prev => ({ ...prev, address: accounts[0] }));
        }
      };

      const handleChainChanged = (chainId: string) => {
        const numericChainId = parseInt(chainId, 16);
        setState(prev => ({ ...prev, chainId: numericChainId }));
        window.location.reload(); // Reload to ensure state is fresh
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [checkConnection]);

  const connect = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      throw new WalletError('MetaMask is not installed. Please install MetaMask to continue.');
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Request account access
      await web3Provider.send('eth_requestAccounts', []);
      
      const accounts = await web3Provider.listAccounts();
      const network = await web3Provider.getNetwork();

      if (accounts.length === 0) {
        throw new WalletError('No accounts found. Please unlock your wallet.');
      }

      setState({
        address: accounts[0],
        chainId: network.chainId,
        isConnected: true,
        isConnecting: false,
        error: null,
      });
      setProvider(web3Provider);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to connect wallet';
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    });
    setProvider(null);
  }, []);

  const switchChain = useCallback(async (chainId: number) => {
    if (typeof window.ethereum === 'undefined') {
      throw new WalletError('MetaMask is not installed.');
    }

    const chain = SUPPORTED_CHAINS[chainId];
    if (!chain) {
      throw new WalletError(`Unsupported chain: ${chainId}`);
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      // If chain doesn't exist, try to add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${chainId.toString(16)}`,
                chainName: chain.name,
                nativeCurrency: chain.nativeCurrency,
                rpcUrls: [chain.rpcUrl],
                blockExplorerUrls: [chain.blockExplorer],
              },
            ],
          });
        } catch (addError) {
          throw new WalletError(`Failed to add chain: ${chain.name}`);
        }
      } else {
        throw new WalletError(`Failed to switch chain: ${error.message || 'Unknown error'}`);
      }
    }
  }, []);

  const value: WalletContextType = {
    ...state,
    connect,
    disconnect,
    switchChain,
    provider,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

