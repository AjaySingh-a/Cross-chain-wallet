export class WalletError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WalletError';
  }
}

export class RPCError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'RPCError';
  }
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
};

export const isRateLimitError = (error: unknown): boolean => {
  if (error instanceof RPCError && error.statusCode === 429) {
    return true;
  }
  if (error instanceof Error) {
    return error.message.includes('429') || error.message.includes('rate limit');
  }
  return false;
};

