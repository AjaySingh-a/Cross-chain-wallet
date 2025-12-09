import { ethers } from 'ethers';
import { Transaction, Chain, SUPPORTED_CHAINS } from '../types';
import { RPCError, isRateLimitError } from '../utils/errors';

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds

interface CacheEntry {
  transactions: Transaction[];
  timestamp: number;
}

class AlchemyService {
  private cache: Map<string, CacheEntry> = new Map();

  private getCacheKey(address: string, chainId: number): string {
    return `${address.toLowerCase()}-${chainId}`;
  }

  private getCachedTransactions(address: string, chainId: number): Transaction[] | null {
    const key = this.getCacheKey(address, chainId);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.transactions;
  }

  private setCachedTransactions(address: string, chainId: number, transactions: Transaction[]): void {
    const key = this.getCacheKey(address, chainId);
    this.cache.set(key, {
      transactions,
      timestamp: Date.now(),
    });
  }

  private async fetchWithRetry<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (isRateLimitError(error) && i < retries - 1) {
          const backoffDelay = delay * Math.pow(2, i);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retries exceeded');
  }

  async getTransactions(
    address: string,
    chainId: number,
    limit: number = 10
  ): Promise<Transaction[]> {
    // Check cache first
    const cached = this.getCachedTransactions(address, chainId);
    if (cached) {
      return cached.slice(0, limit);
    }

    const chain = SUPPORTED_CHAINS[chainId];
    if (!chain) {
      throw new RPCError(`Unsupported chain: ${chainId}`);
    }

    if (!chain.rpcUrl) {
      throw new RPCError(`RPC URL not configured for ${chain.name}`);
    }

    try {
      const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl);
      
      // Validate address
      if (!ethers.utils.isAddress(address)) {
        throw new RPCError('Invalid wallet address');
      }

      const transactions = await this.fetchWithRetry(async () => {
        // Get transaction history using Alchemy's getAssetTransfers API
        // Since we're using standard JSON-RPC, we'll use eth_getTransactionCount
        // and fetch recent transactions from blocks
        return await this.fetchRecentTransactions(provider, address, chain, limit);
      });

      // Cache the results
      this.setCachedTransactions(address, chainId, transactions);
      
      return transactions;
    } catch (error) {
      if (error instanceof RPCError) {
        throw error;
      }
      
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message.includes('429') || message.includes('rate limit')) {
        throw new RPCError('Rate limit exceeded. Please try again in a moment.', 429);
      }
      if (message.includes('network') || message.includes('fetch')) {
        throw new RPCError('Network connection failed. Please check your internet connection.');
      }
      
      throw new RPCError(`Failed to fetch transactions: ${message}`);
    }
  }

  private async fetchRecentTransactions(
    provider: ethers.providers.JsonRpcProvider,
    address: string,
    chain: Chain,
    limit: number
  ): Promise<Transaction[]> {
    try {
      // Get current block number
      const currentBlock = await provider.getBlockNumber();
      
      // Fetch transactions from recent blocks
      // We'll check the last 1000 blocks to find transactions
      const blocksToCheck = Math.min(1000, currentBlock);
      const startBlock = Math.max(0, currentBlock - blocksToCheck);
      
      const transactions: Transaction[] = [];
      const addressLower = address.toLowerCase();

      // Fetch blocks in batches to avoid overwhelming the RPC
      const batchSize = 10;
      for (let i = startBlock; i <= currentBlock && transactions.length < limit; i += batchSize) {
        const endBlock = Math.min(i + batchSize - 1, currentBlock);
        const blockPromises: Promise<ethers.providers.Block | null>[] = [];
        
        for (let j = i; j <= endBlock; j++) {
          blockPromises.push(provider.getBlockWithTransactions(j));
        }

        const blocks = await Promise.all(blockPromises);

        for (const block of blocks) {
          if (!block || !block.transactions) continue;

          for (const tx of block.transactions) {
            if (transactions.length >= limit) break;
            
            const fromLower = tx.from?.toLowerCase() || '';
            const toLower = tx.to?.toLowerCase() || '';
            
            if (fromLower === addressLower || toLower === addressLower) {
              const receipt = await provider.getTransactionReceipt(tx.hash).catch(() => null);
              
              transactions.push({
                hash: tx.hash,
                from: tx.from || '',
                to: tx.to || '',
                value: tx.value?.toString() || '0',
                timestamp: block.timestamp,
                type: fromLower === addressLower ? 'sent' : 'received',
                status: receipt
                  ? receipt.status === 1
                    ? 'confirmed'
                    : 'failed'
                  : 'pending',
                chainId: chain.id,
                chainName: chain.name,
                blockNumber: block.number,
                gasUsed: receipt?.gasUsed?.toString(),
                gasPrice: tx.gasPrice?.toString(),
              });
            }
          }
        }
      }

      // Sort by timestamp (newest first) and limit
      return transactions
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    } catch (error) {
      // Fallback: try using Alchemy's enhanced API if available
      // For now, return empty array if standard RPC fails
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  async getTransactionsForMultipleChains(
    address: string,
    chainIds: number[],
    limit: number = 10
  ): Promise<Transaction[]> {
    // Fetch transactions in parallel for better performance
    // This is faster than sequential fetching and allows us to show results as they come in
    const promises = chainIds.map(chainId =>
      this.getTransactions(address, chainId, limit).catch(error => {
        console.error(`Error fetching transactions for chain ${chainId}:`, error);
        return [] as Transaction[];
      })
    );

    const results = await Promise.all(promises);
    
    // Flatten and sort all transactions by timestamp
    const allTransactions = results.flat();
    return allTransactions.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  clearCache(): void {
    this.cache.clear();
  }

  clearCacheForAddress(address: string, chainId?: number): void {
    if (chainId !== undefined) {
      const key = this.getCacheKey(address, chainId);
      this.cache.delete(key);
    } else {
      // Clear all caches for this address
      const keysToDelete: string[] = [];
      this.cache.forEach((_, key) => {
        if (key.startsWith(address.toLowerCase())) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.cache.delete(key));
    }
  }
}

export const alchemyService = new AlchemyService();

