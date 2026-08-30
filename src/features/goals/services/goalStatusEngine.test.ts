import { describe, expect, it } from 'vitest';

import type { Goal } from '../types';
import { calculateExpectedProgress, calculateGoalStatus } from './goalStatusEngine';

function buildGoal(overrides: Partial<Goal> = {}): Goal {
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
      targetValue: 100,
    },
    progressMode: 'manual',
    startDate: '2026-01-01',
    targetDate: '2026-12-31',
    tags: [],
    checkInFrequency: 'none',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('calculateExpectedProgress', () => {
  it('is ~50% at the midpoint of a Jan 1 → Dec 31 goal', () => {
    const goal = buildGoal({ startDate: '2026-01-01', targetDate: '2026-12-31' });
    const expected = calculateExpectedProgress(goal, new Date('2026-07-02T00:00:00'));
    expect(expected).not.toBeNull();
    expect(expected!).toBeGreaterThanOrEqual(49);
    expect(expected!).toBeLessThanOrEqual(51);
  });

  it('is 50% after 50 of 100 days', () => {
    const goal = buildGoal({ startDate: '2026-01-01', targetDate: '2026-04-11' }); // 100 days apart
    const expected = calculateExpectedProgress(goal, new Date('2026-02-20T00:00:00')); // 50 days in
    expect(expected).toBe(50);
  });

  it('returns null when there is no deadline', () => {
    const goal = buildGoal({ targetDate: undefined });
    expect(calculateExpectedProgress(goal, new Date('2026-07-02'))).toBeNull();
  });

  it('uses milestone due dates instead of a straight time fraction for milestone goals', () => {
    const goal = buildGoal({
      type: 'milestone',
      measurement: { type: 'milestone' },
      startDate: '2026-01-01',
      targetDate: '2026-12-31',
      milestones: [
        { id: 'm1', title: 'Um', completed: false, order: 0, targetDate: '2026-02-01' },
        { id: 'm2', title: 'Dois', completed: false, order: 1, targetDate: '2026-11-01' },
      ],
    });
    // Only the first milestone's due date has passed by June.
    expect(calculateExpectedProgress(goal, new Date('2026-06-01'))).toBe(50);
  });
});

describe('calculateGoalStatus', () => {
  it('flags atRisk when real progress trails expected progress by a wide gap', () => {
    expect(calculateGoalStatus(20, 50, true)).toBe('atRisk');
  });

  it('flags attention for a moderate gap', () => {
    expect(calculateGoalStatus(45, 55, true)).toBe('attention');
  });

  it('is onTrack when real progress matches or beats the expected pace', () => {
    expect(calculateGoalStatus(60, 50, true)).toBe('onTrack');
  });

  it('is onTrack when there is no deadline to assess pace against', () => {
    expect(calculateGoalStatus(10, null, true)).toBe('onTrack');
  });

  it('is notStarted when there is no progress yet and nothing logged', () => {
    expect(calculateGoalStatus(0, 50, false)).toBe('notStarted');
  });
});
