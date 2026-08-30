import { describe, expect, it } from 'vitest';

import type { Goal } from '../../types';
import { calculateBinaryProgress } from './binaryProgressStrategy';

function buildGoal(completed: boolean): Goal {
  return {
    id: 'goal-1',
    title: 'Publicar portfólio',
    area: 'work',
    type: 'binary',
    status: 'onTrack',
    systemStatus: 'onTrack',
    priority: 'medium',
    measurement: { type: 'binary', completed },
    progressMode: 'manual',
    startDate: '2026-01-01',
    tags: [],
    checkInFrequency: 'none',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('calculateBinaryProgress', () => {
  it('is 0% when not completed', () => {
    expect(calculateBinaryProgress(buildGoal(false)).percent).toBe(0);
  });

  it('is 100% when completed', () => {
    expect(calculateBinaryProgress(buildGoal(true)).percent).toBe(100);
  });
});
