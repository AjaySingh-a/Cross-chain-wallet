const SELECTED_CHAIN_KEY = 'wallet_dashboard_selected_chain';

export const storage = {
  getSelectedChain: (): number | null => {
    try {
      const stored = localStorage.getItem(SELECTED_CHAIN_KEY);
      return stored ? parseInt(stored, 10) : null;
    } catch {
      return null;
    }
  },

  setSelectedChain: (chainId: number): void => {
    try {
      localStorage.setItem(SELECTED_CHAIN_KEY, chainId.toString());
    } catch (error) {
      console.error('Failed to save selected chain:', error);
    }
  },
};

