import { describe, expect, it } from 'vitest';

import type { Goal, GoalNumericMeasurement } from '../../types';
import { calculateNumericProgress } from './numericProgressStrategy';

function buildGoal(measurement: GoalNumericMeasurement): Goal {
  return {
    id: 'goal-1',
    title: 'Meta',
    area: 'personal',
    type: 'numeric',
    status: 'onTrack',
    systemStatus: 'onTrack',
    priority: 'medium',
    measurement,
    progressMode: 'manual',
    startDate: '2026-01-01',
    tags: [],
    checkInFrequency: 'none',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('calculateNumericProgress', () => {
  it('computes a simple increase with baseline 0', () => {
    const goal = buildGoal({
      type: 'numeric',
      direction: 'increase',
      unit: 'units',
      baseline: 0,
      currentValue: 5,
      targetValue: 10,
    });
    expect(calculateNumericProgress(goal).percent).toBe(50);
  });

  it('respects a non-zero baseline', () => {
    const goal = buildGoal({
      type: 'numeric',
      direction: 'increase',
      unit: 'units',
      baseline: 50,
      currentValue: 75,
      targetValue: 100,
    });
    expect(calculateNumericProgress(goal).percent).toBe(50);
  });

  it('computes a reduction goal (direction: decrease)', () => {
    const goal = buildGoal({
      type: 'numeric',
      direction: 'decrease',
      unit: 'units',
      baseline: 100,
      currentValue: 80,
      targetValue: 60,
    });
    expect(calculateNumericProgress(goal).percent).toBe(50);
  });

  it('clamps display percent at 100 even when the real value passed the target', () => {
    const goal = buildGoal({
      type: 'numeric',
      direction: 'increase',
      unit: 'units',
      baseline: 0,
      currentValue: 22,
      targetValue: 20,
    });
    expect(calculateNumericProgress(goal).percent).toBe(100);
  });

  it('keeps the true rawPercent above 100 when overachievement is allowed', () => {
    const goal = buildGoal({
      type: 'numeric',
      direction: 'increase',
      unit: 'units',
      baseline: 0,
      currentValue: 22,
      targetValue: 20,
      allowOverachievement: true,
    });
    const result = calculateNumericProgress(goal);
    expect(result.percent).toBe(100);
    expect(result.rawPercent).toBe(110);
  });

  it('never reports a negative percent when behind the baseline', () => {
    const goal = buildGoal({
      type: 'numeric',
      direction: 'increase',
      unit: 'units',
      baseline: 10,
      currentValue: 5,
      targetValue: 20,
    });
    expect(calculateNumericProgress(goal).percent).toBe(0);
  });

  it('is already 100% when baseline and target are the same and current has met it', () => {
    const goal = buildGoal({
      type: 'numeric',
      direction: 'increase',
      unit: 'units',
      baseline: 10,
      currentValue: 10,
      targetValue: 10,
    });
    expect(calculateNumericProgress(goal).percent).toBe(100);
  });

  it('is 0% when baseline and target are the same but current hasn’t reached it', () => {
    const goal = buildGoal({
      type: 'numeric',
      direction: 'increase',
      unit: 'units',
      baseline: 10,
      currentValue: 5,
      targetValue: 10,
    });
    expect(calculateNumericProgress(goal).percent).toBe(0);
  });
});
