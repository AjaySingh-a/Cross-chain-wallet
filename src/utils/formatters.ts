import { ethers } from 'ethers';
import { SUPPORTED_CHAINS } from '../types';

export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatAmount = (value: string, decimals: number = 18): string => {
  try {
    const formatted = ethers.utils.formatUnits(value, decimals);
    const num = parseFloat(formatted);
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    return num.toFixed(6).replace(/\.?0+$/, '');
  } catch {
    return '0';
  }
};

export const formatUSD = (value: string, decimals: number = 18): string => {
  try {
    const formatted = ethers.utils.formatUnits(value, decimals);
    const num = parseFloat(formatted);
    // Placeholder USD calculation - in production, fetch from price API
    // Using approximate ETH price of $2000 as placeholder
    const approximatePrice = 2000;
    const usdValue = num * approximatePrice;
    if (usdValue < 0.01) return '< $0.01';
    return `$${usdValue.toFixed(2)}`;
  } catch {
    return '$0.00';
  }
};

export const getChainName = (chainId: number): string => {
  return SUPPORTED_CHAINS[chainId]?.name || `Chain ${chainId}`;
};

export const getChainSymbol = (chainId: number): string => {
  return SUPPORTED_CHAINS[chainId]?.nativeCurrency.symbol || 'ETH';
};

