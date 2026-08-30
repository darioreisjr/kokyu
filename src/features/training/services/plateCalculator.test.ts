import { describe, expect, it } from 'vitest';

import { calculatePlateBreakdown } from './plateCalculator';

describe('calculatePlateBreakdown', () => {
  it('splits the load evenly per side using the largest plates first', () => {
    // Bar 20kg, target 100kg → 80kg to distribute → 40kg per side → greedy largest-first: 25 + 15
    const result = calculatePlateBreakdown(100, 20, [25, 20, 15, 10, 5, 2.5, 1.25]);
    expect(result.platesPerSide).toEqual([25, 15]);
    expect(result.achievedWeightKg).toBe(100);
    expect(result.achievable).toBe(true);
    expect(result.remainderKg).toBe(0);
  });

  it('mixes plate sizes when a single size cannot cover the remainder', () => {
    // Bar 20kg, target 142.5kg → 61.25kg per side → 25+25+10+1.25
    const result = calculatePlateBreakdown(142.5, 20, [25, 20, 15, 10, 5, 2.5, 1.25]);
    expect(result.platesPerSide).toEqual([25, 25, 10, 1.25]);
    expect(result.achievable).toBe(true);
  });

  it('reports the closest achievable combination when the target cannot be hit exactly', () => {
    // Bar 20kg, target 101kg → 40.5kg per side, but no plate finer than 1.25kg exists → 40kg
    const result = calculatePlateBreakdown(101, 20, [25, 20, 15, 10, 5, 2.5, 1.25]);
    expect(result.achievable).toBe(false);
    expect(result.achievedWeightKg).toBe(100);
    expect(result.remainderKg).toBeCloseTo(1, 5);
  });

  it('returns no plates when the target is at or below the bar weight', () => {
    const atBar = calculatePlateBreakdown(20, 20, [25, 20, 15, 10, 5, 2.5, 1.25]);
    expect(atBar.platesPerSide).toEqual([]);
    expect(atBar.achievable).toBe(true);

    const belowBar = calculatePlateBreakdown(15, 20, [25, 20, 15, 10, 5, 2.5, 1.25]);
    expect(belowBar.platesPerSide).toEqual([]);
    expect(belowBar.achievable).toBe(false);
  });
});
