import React, { useEffect, useState } from 'react';
import { Transaction } from '../types';
import { useWallet } from '../context/WalletContext';
import { alchemyService } from '../services/alchemy';
import { TransactionItem } from './TransactionItem';
import { LoadingSpinner, LoadingText } from './LoadingSpinner';
import { ErrorDisplay } from './ErrorDisplay';
import { RPCError } from '../utils/errors';

interface TransactionListProps {
  selectedChains: number[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ selectedChains }) => {
  const { address, isConnected } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address || selectedChains.length === 0) {
      setTransactions([]);
      return;
    }

    const fetchTransactions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const fetched = await alchemyService.getTransactionsForMultipleChains(
          address,
          selectedChains,
          10
        );
        setTransactions(fetched);
      } catch (err) {
        const message =
          err instanceof RPCError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Failed to fetch transactions';
        setError(message);
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [address, isConnected, selectedChains]);

  if (!isConnected || !address) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">Please connect your wallet to view transactions.</p>
      </div>
    );
  }

  if (selectedChains.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">Please select at least one chain to view transactions.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h2>
        <LoadingSpinner />
        <LoadingText message="Fetching transactions from selected chains..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h2>
        <ErrorDisplay message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h2>
        <p className="text-gray-500">No transactions found for the selected chains.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
        <span className="text-sm text-gray-500">
          Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="space-y-3">
        {transactions.map(tx => (
          <TransactionItem key={`${tx.hash}-${tx.chainId}`} transaction={tx} walletAddress={address} />
        ))}
      </div>
    </div>
  );
};

