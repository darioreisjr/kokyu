import type { E1RMFormula } from '../types';

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Centralized so the estimate is never scattered across components — always presented to the user
 * as "1RM estimado", never an exact measurement (see `docs/training.md`).
 */
export function calculateEstimatedOneRepMax(
  weightKg: number,
  reps: number,
  formula: E1RMFormula = 'epley',
): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return round1(weightKg);

  if (formula === 'brzycki') {
    const denominator = 37 - reps;
    // Brzycki is only valid below 37 reps — fall back to Epley outside that range instead of dividing by zero/negative.
    if (denominator <= 0) return round1(weightKg * (1 + reps / 30));
    return round1((weightKg * 36) / denominator);
  }

  return round1(weightKg * (1 + reps / 30));
}
