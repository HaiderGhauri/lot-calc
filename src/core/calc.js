// src/core/calc.js
import { pipValuePerStdLot } from './pairs.js';

export function calcLot({ balance, riskPercent, stopPips, pair }) {
  const pipValue = pipValuePerStdLot(pair);
  if (!pipValue) return null;

  const riskAmount = balance * (riskPercent / 100);
  if (stopPips <= 0 || pipValue <= 0) return 0;

  let lots = riskAmount / (stopPips * pipValue);

  // --- 👇 New Logic ---
  const MIN_LOT = 0.01;    // smallest lot broker allows
  const LOT_STEP = 0.01;   // increment (e.g., 0.01, 0.02, etc.)

  // round to nearest step
  lots = Math.floor(lots / LOT_STEP) * LOT_STEP;

  // enforce minimum
  if (lots < MIN_LOT) lots = MIN_LOT;

  return Number(lots.toFixed(2));
}