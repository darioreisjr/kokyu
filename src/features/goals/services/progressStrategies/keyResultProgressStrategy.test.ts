import { describe, expect, it } from 'vitest';

import type { Goal, GoalKeyResult } from '../../types';
import { calculateKeyResultProgress } from './keyResultProgressStrategy';

function buildGoal(keyResults: GoalKeyResult[]): Goal {
  return {
    id: 'goal-1',
    title: 'Melhorar minha carreira',
    area: 'work',
    type: 'keyResult',
    status: 'onTrack',
    systemStatus: 'onTrack',
    priority: 'focus',
    measurement: { type: 'keyResult' },
    progressMode: 'manual',
    startDate: '2026-01-01',
    keyResults,
    tags: [],
    checkInFrequency: 'none',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('calculateKeyResultProgress', () => {
  it('weights key results 50/50 — one done, one at 0% → 50%', () => {
    const keyResults: GoalKeyResult[] = [
      {
        id: 'kr1',
        title: 'KR1',
        type: 'numeric',
        baseline: 0,
        current: 10,
        target: 10,
        unit: 'units',
        weight: 50,
        status: 'completed',
      },
      {
        id: 'kr2',
        title: 'KR2',
        type: 'numeric',
        baseline: 0,
        current: 0,
        target: 10,
        unit: 'units',
        weight: 50,
        status: 'notStarted',
      },
    ];
    expect(calculateKeyResultProgress(buildGoal(keyResults)).percent).toBe(50);
  });

  it('falls back to equal weight when none is set', () => {
    const keyResults: GoalKeyResult[] = [
      {
        id: 'kr1',
        title: 'KR1',
        type: 'binary',
        baseline: 0,
        current: 1,
        target: 1,
        unit: 'units',
        status: 'completed',
      },
      {
        id: 'kr2',
        title: 'KR2',
        type: 'binary',
        baseline: 0,
        current: 0,
        target: 1,
        unit: 'units',
        status: 'notStarted',
      },
    ];
    expect(calculateKeyResultProgress(buildGoal(keyResults)).percent).toBe(50);
  });
});
