// src/core/pairs.js

export const ALLOWED_PAIRS = {
  EURUSD: 10,     // $10 per pip per standard lot
  GBPUSD: 10,
  USDJPY: 9,
  AUDUSD: 10,
  NZDUSD: 10,
  XAUUSD: 100,    // Gold (XAUUSD) ≈ $100 per pip per 1.0 lot
  XAGUSD: 50,
  // Add more pairs if needed
};

// helper
export function isAllowedPair(pair) {
  return Object.keys(ALLOWED_PAIRS).includes(pair.toUpperCase());
}

export function pipValuePerStdLot(pair) {
  return ALLOWED_PAIRS[pair.toUpperCase()] || null;
}
 