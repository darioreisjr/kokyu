import { describe, expect, it } from 'vitest';

import type { Goal, GoalConsistencyMeasurement } from '../../types';
import { calculateConsistencyProgress } from './consistencyProgressStrategy';

function buildGoal(measurement: GoalConsistencyMeasurement): Goal {
  return {
    id: 'goal-1',
    title: 'Manter consistência',
    area: 'habits',
    type: 'consistency',
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

describe('calculateConsistencyProgress', () => {
  it('computes progress toward a weekly frequency target', () => {
    const goal = buildGoal({
      type: 'consistency',
      unit: 'times',
      baseline: 0,
      currentValue: 3,
      targetValue: 4,
      periodDays: 7,
    });
    expect(calculateConsistencyProgress(goal).percent).toBe(75);
  });

  it('is 100% when baseline and target are equal and the current value has met it', () => {
    const goal = buildGoal({
      type: 'consistency',
      unit: 'times',
      baseline: 4,
      currentValue: 4,
      targetValue: 4,
    });
    expect(calculateConsistencyProgress(goal).percent).toBe(100);
  });

  it('allows overachievement past 100% for the raw value (e.g. 90% consistency vs. an 80% target)', () => {
    const goal = buildGoal({
      type: 'consistency',
      unit: 'percentage',
      baseline: 0,
      currentValue: 90,
      targetValue: 80,
      allowOverachievement: true,
    });
    const result = calculateConsistencyProgress(goal);
    expect(result.percent).toBe(100);
    expect(result.rawPercent).toBe(113);
  });
});
