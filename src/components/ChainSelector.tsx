import React, { useEffect, useState } from 'react';
import { SUPPORTED_CHAINS, CHAIN_IDS } from '../types';
import { useWallet } from '../context/WalletContext';
import { storage } from '../utils/storage';

interface ChainSelectorProps {
  selectedChains: number[];
  onChainsChange: (chains: number[]) => void;
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({ selectedChains, onChainsChange }) => {
  const { switchChain } = useWallet();
  const [isSwitching, setIsSwitching] = useState<number | null>(null);

  useEffect(() => {
    // Load persisted selection from localStorage
    const persisted = storage.getSelectedChain();
    if (persisted && SUPPORTED_CHAINS[persisted]) {
      if (!selectedChains.includes(persisted)) {
        onChainsChange([persisted]);
      }
    }
  }, []);

  const handleChainToggle = (chainId: number) => {
    if (selectedChains.includes(chainId)) {
      const newChains = selectedChains.filter(id => id !== chainId);
      onChainsChange(newChains);
      if (newChains.length > 0) {
        storage.setSelectedChain(newChains[0]);
      }
    } else {
      const newChains = [...selectedChains, chainId];
      onChainsChange(newChains);
      storage.setSelectedChain(chainId);
    }
  };

  const handleSwitchNetwork = async (chainId: number) => {
    setIsSwitching(chainId);
    try {
      await switchChain(chainId);
    } catch (error) {
      console.error('Failed to switch chain:', error);
    } finally {
      setIsSwitching(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Chains</h2>
      <div className="flex flex-wrap gap-3">
        {CHAIN_IDS.map(chainId => {
          const chain = SUPPORTED_CHAINS[chainId];
          const isSelected = selectedChains.includes(chainId);
          
          return (
            <div
              key={chainId}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => handleChainToggle(chainId)}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleChainToggle(chainId)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                {chain.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSwitchNetwork(chainId);
                }}
                disabled={isSwitching === chainId}
                className="ml-2 text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                title="Switch to this network"
              >
                {isSwitching === chainId ? 'Switching...' : 'Switch'}
              </button>
            </div>
          );
        })}
      </div>
      {selectedChains.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">Select at least one chain to view transactions.</p>
      )}
    </div>
  );
};

