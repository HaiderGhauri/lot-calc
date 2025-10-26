// src/core/calc.js
import { pipValuePerStdLot } from './pairs.js';

export function calcLot({ balance, riskPercent, stopPips, pair }) {
  const pipValue = pipValuePerStdLot(pair);
  // 1) hard validation — zero/negative → 0
  if (!pipValue || balance <= 0 || riskPercent <= 0 || stopPips <= 0) return 0;

  const riskAmount = balance * (riskPercent / 100);
  let rawLots = riskAmount / (stopPips * pipValue);

  // 2) if math se <= 0 aaya, don't clamp up; just 0
  if (rawLots <= 0) return 0;

  // 3) broker rules (only for positive lots)
  const MIN_LOT = 0.01;
  const LOT_STEP = 0.01;

  // round **down** to step, then enforce minimum (only if > 0)
  let lots = Math.floor(rawLots / LOT_STEP) * LOT_STEP;
  if (lots < MIN_LOT) lots = MIN_LOT;

  // 2 decimals are enough for standard FX brokers
  return Number(lots.toFixed(2));
}