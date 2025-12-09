import React from 'react';
import { Transaction } from '../types';
import { formatAddress, formatTimestamp, formatAmount, formatUSD, getChainSymbol } from '../utils/formatters';

interface TransactionItemProps {
  transaction: Transaction;
  walletAddress: string;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, walletAddress }) => {
  const isSent = transaction.type === 'sent';
  const otherAddress = isSent ? transaction.to : transaction.from;

  const statusColors = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isSent ? 'bg-red-100' : 'bg-green-100'
              }`}
            >
              {isSent ? (
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7l-7 7-7-7" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-medium ${isSent ? 'text-red-600' : 'text-green-600'}`}>
                  {isSent ? 'Sent' : 'Received'}
                </span>
                <span className="text-sm text-gray-500">{transaction.chainName}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[transaction.status]}`}
                >
                  {transaction.status}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                <span>{formatTimestamp(transaction.timestamp)}</span>
                {transaction.blockNumber && (
                  <>
                    <span>•</span>
                    <span>Block #{transaction.blockNumber.toLocaleString()}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="ml-14 space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">{isSent ? 'To:' : 'From:'}</span>
              <span className="font-mono text-gray-900">{formatAddress(otherAddress)}</span>
              <button
                onClick={() => navigator.clipboard.writeText(otherAddress)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Copy address"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Hash:</span>
              <span className="font-mono text-gray-900 text-xs">{formatAddress(transaction.hash)}</span>
              <button
                onClick={() => navigator.clipboard.writeText(transaction.hash)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Copy hash"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="ml-14 md:ml-0 text-right">
          <div className="text-lg font-semibold text-gray-900">
            {isSent ? '-' : '+'}
            {formatAmount(transaction.value)} {getChainSymbol(transaction.chainId)}
          </div>
          <div className="text-sm text-gray-500">
            {transaction.valueInUSD || formatUSD(transaction.value)}
          </div>
        </div>
      </div>
    </div>
  );
};

