import React, { useState, useEffect } from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import { WalletConnection } from './components/WalletConnection';
import { ChainSelector } from './components/ChainSelector';
import { TransactionList } from './components/TransactionList';
import { CHAIN_IDS } from './types';
import { storage } from './utils/storage';

const AppContent: React.FC = () => {
  const { isConnected } = useWallet();
  const [selectedChains, setSelectedChains] = useState<number[]>([]);

  useEffect(() => {
    // Initialize with persisted chain or default to Ethereum
    const persisted = storage.getSelectedChain();
    if (persisted && CHAIN_IDS.includes(persisted)) {
      setSelectedChains([persisted]);
    } else {
      setSelectedChains([1]); // Default to Ethereum
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Cross-Chain Wallet Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">View your wallet activity across multiple blockchain networks</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <WalletConnection />

          {isConnected && (
            <>
              <ChainSelector selectedChains={selectedChains} onChainsChange={setSelectedChains} />
              <TransactionList selectedChains={selectedChains} />
            </>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Built with React, TypeScript, ethers.js, and Alchemy
          </p>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
};

export default App;

