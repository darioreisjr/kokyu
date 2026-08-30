import { describe, expect, it } from 'vitest';

import { calculateEstimatedOneRepMax } from './estimatedOneRepMaxCalculator';

describe('calculateEstimatedOneRepMax', () => {
  it('returns the weight itself for a single rep', () => {
    expect(calculateEstimatedOneRepMax(100, 1)).toBe(100);
  });

  it('applies the Epley formula by default', () => {
    // 100 * (1 + 5/30) = 116.7
    expect(calculateEstimatedOneRepMax(100, 5)).toBe(116.7);
  });

  it('applies the Brzycki formula when requested', () => {
    // 100 * 36 / (37 - 5) = 112.5
    expect(calculateEstimatedOneRepMax(100, 5, 'brzycki')).toBe(112.5);
  });

  it('falls back to Epley when Brzycki would divide by a non-positive number', () => {
    const epley = calculateEstimatedOneRepMax(50, 40);
    expect(calculateEstimatedOneRepMax(50, 40, 'brzycki')).toBe(epley);
  });

  it('returns 0 for non-positive weight or reps', () => {
    expect(calculateEstimatedOneRepMax(0, 5)).toBe(0);
    expect(calculateEstimatedOneRepMax(100, 0)).toBe(0);
  });
});
