import { describe, expect, it } from 'vitest';

import { calculateWarmupSets } from './warmupCalculator';

describe('calculateWarmupSets', () => {
  it('generates an ascending percentage ramp ending below the working weight', () => {
    const sets = calculateWarmupSets(100, 8, 3);
    expect(sets).toHaveLength(3);
    expect(sets[0]!.percentOfWorkingWeight).toBeLessThan(sets[1]!.percentOfWorkingWeight);
    expect(sets[1]!.percentOfWorkingWeight).toBeLessThan(sets[2]!.percentOfWorkingWeight);
    expect(sets.every((set) => set.weightKg < 100)).toBe(true);
  });

  it('generates descending reps as the load increases', () => {
    const sets = calculateWarmupSets(100, 8, 3);
    expect(sets[0]!.reps).toBeGreaterThanOrEqual(sets[1]!.reps);
    expect(sets[1]!.reps).toBeGreaterThanOrEqual(sets[2]!.reps);
  });

  it('respects a custom set count', () => {
    expect(calculateWarmupSets(100, 8, 5)).toHaveLength(5);
    expect(calculateWarmupSets(100, 8, 1)).toHaveLength(1);
  });

  it('returns an empty array for a non-positive working weight', () => {
    expect(calculateWarmupSets(0, 8)).toEqual([]);
  });
});
