import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { formatAddress, getChainName } from '../utils/formatters';
import { ErrorDisplay } from './ErrorDisplay';

export const WalletConnection: React.FC = () => {
  const { address, chainId, isConnected, isConnecting, error, connect, disconnect } = useWallet();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleConnect = async () => {
    setLocalError(null);
    try {
      await connect();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      setLocalError(message);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setLocalError(null);
  };

  if (isConnected && address) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Connected Wallet</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Address:</span>
                <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                  {formatAddress(address)}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(address)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy address"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Network:</span>
                <span className="text-sm font-medium text-gray-900">
                  {chainId ? getChainName(chainId) : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Disconnect
          </button>
        </div>
        {(error || localError) && (
          <div className="mt-4">
            <ErrorDisplay message={error || localError || ''} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Connect Your Wallet</h2>
      <p className="text-sm text-gray-600 mb-4">
        Connect your MetaMask wallet to view your transaction history across multiple chains.
      </p>
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
      </button>
      {(error || localError) && (
        <div className="mt-4">
          <ErrorDisplay message={error || localError || ''} />
        </div>
      )}
      {typeof window.ethereum === 'undefined' && (
        <div className="mt-4">
          <ErrorDisplay
            message="MetaMask is not installed. Please install MetaMask extension to continue."
            className="bg-yellow-50 border-yellow-200"
          />
        </div>
      )}
    </div>
  );
};

