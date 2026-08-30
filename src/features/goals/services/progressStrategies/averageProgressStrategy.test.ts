import { describe, expect, it } from 'vitest';

import type { Goal } from '../../types';
import { calculateAverageProgress } from './averageProgressStrategy';

function buildGoal(currentValue: number, targetValue: number): Goal {
  return {
    id: 'goal-1',
    title: 'Ler em média 30 minutos por dia',
    area: 'leisure',
    type: 'average',
    status: 'onTrack',
    systemStatus: 'onTrack',
    priority: 'low',
    measurement: { type: 'average', unit: 'minutes', targetValue, periodDays: 30, currentValue },
    progressMode: 'manual',
    startDate: '2026-01-01',
    tags: [],
    checkInFrequency: 'none',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('calculateAverageProgress', () => {
  it('compares the maintained rolling average against the target', () => {
    expect(calculateAverageProgress(buildGoal(15, 30)).percent).toBe(50);
  });

  it('never divides by zero when the target itself is 0', () => {
    expect(calculateAverageProgress(buildGoal(0, 0)).percent).toBe(0);
  });
});
