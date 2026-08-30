import { describe, expect, it } from 'vitest';

import type { Goal } from '../types';
import { getGoalHorizon } from './goalHorizon';

function buildGoal(targetDate: string | undefined): Goal {
  return {
    id: 'goal-1',
    title: 'Meta',
    area: 'personal',
    type: 'numeric',
    status: 'onTrack',
    systemStatus: 'onTrack',
    priority: 'medium',
    measurement: {
      type: 'numeric',
      direction: 'increase',
      unit: 'units',
      baseline: 0,
      currentValue: 0,
      targetValue: 10,
    },
    progressMode: 'manual',
    startDate: '2026-01-01',
    targetDate,
    tags: [],
    checkInFrequency: 'none',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

const now = new Date('2026-06-01T00:00:00');

describe('getGoalHorizon', () => {
  it('is "now" within a week', () => {
    expect(getGoalHorizon(buildGoal('2026-06-05'), now)).toBe('now');
  });

  it('is "month" within about a month', () => {
    expect(getGoalHorizon(buildGoal('2026-06-20'), now)).toBe('month');
  });

  it('is "quarter" within about 3 months', () => {
    expect(getGoalHorizon(buildGoal('2026-08-01'), now)).toBe('quarter');
  });

  it('is "year" within about a year', () => {
    expect(getGoalHorizon(buildGoal('2027-01-01'), now)).toBe('year');
  });

  it('is "longTerm" beyond a year', () => {
    expect(getGoalHorizon(buildGoal('2028-01-01'), now)).toBe('longTerm');
  });

  it('is "noDeadline" when there is no target date', () => {
    expect(getGoalHorizon(buildGoal(undefined), now)).toBe('noDeadline');
  });
});
