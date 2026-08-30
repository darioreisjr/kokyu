import { describe, expect, it } from 'vitest';

import type { Goal } from '../types';
import { calculateGoalProgress } from './goalProgressEngine';

function buildAutomaticGoal(overrides: Partial<Goal>): Goal {
  return {
    id: 'goal-1',
    title: 'Meta automática',
    area: 'leisure',
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
      targetValue: 20,
    },
    progressMode: 'automatic',
    startDate: '2026-01-01',
    tags: [],
    checkInFrequency: 'none',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('calculateGoalProgress — automatic sources', () => {
  it('reads 8 books completed from the leisure adapter against a target of 20 → 40%', async () => {
    const goal = buildAutomaticGoal({
      source: { module: 'leisure', metricId: 'leisure.booksCompleted' },
    });
    const result = await calculateGoalProgress(goal);
    expect(result.current).toBe(8);
    expect(result.percent).toBe(40);
  });

  it('reads 30 sessions from the training adapter against a target of 100 → 30%', async () => {
    const goal = buildAutomaticGoal({
      measurement: {
        type: 'numeric',
        direction: 'increase',
        unit: 'workouts',
        baseline: 0,
        currentValue: 0,
        targetValue: 100,
      },
      source: { module: 'training', metricId: 'training.sessionsCompleted' },
    });
    const result = await calculateGoalProgress(goal);
    expect(result.current).toBe(30);
    expect(result.percent).toBe(30);
  });

  it('reads consistency rate from the habit adapter', async () => {
    const goal = buildAutomaticGoal({
      measurement: {
        type: 'numeric',
        direction: 'increase',
        unit: 'percentage',
        baseline: 0,
        currentValue: 0,
        targetValue: 90,
      },
      source: { module: 'habit', metricId: 'habit.consistencyRate' },
    });
    const result = await calculateGoalProgress(goal);
    expect(result.current).toBe(90);
  });

  it('reads recipes cooked from the nutrition adapter', async () => {
    const goal = buildAutomaticGoal({
      measurement: {
        type: 'numeric',
        direction: 'increase',
        unit: 'recipes',
        baseline: 0,
        currentValue: 0,
        targetValue: 20,
      },
      source: { module: 'nutrition', metricId: 'nutrition.recipesCooked' },
    });
    const result = await calculateGoalProgress(goal);
    expect(result.current).toBe(17);
  });

  it('reads completed missions from the mission adapter', async () => {
    const goal = buildAutomaticGoal({
      measurement: {
        type: 'numeric',
        direction: 'increase',
        unit: 'missions',
        baseline: 0,
        currentValue: 0,
        targetValue: 50,
      },
      source: { module: 'mission', metricId: 'mission.completedCount' },
    });
    const result = await calculateGoalProgress(goal);
    expect(result.current).toBe(42);
  });

  it('falls back to 0 for an unknown metric id on a known module', async () => {
    const goal = buildAutomaticGoal({
      source: { module: 'leisure', metricId: 'leisure.unknownMetric' },
    });
    const result = await calculateGoalProgress(goal);
    expect(result.current).toBe(0);
  });

  it('never mixes the manual strategy with an automatic source — automatic always wins', async () => {
    const goal = buildAutomaticGoal({
      measurement: {
        type: 'numeric',
        direction: 'increase',
        unit: 'units',
        baseline: 0,
        currentValue: 999,
        targetValue: 20,
      },
      source: { module: 'leisure', metricId: 'leisure.booksCompleted' },
    });
    const result = await calculateGoalProgress(goal);
    expect(result.current).toBe(8);
  });
});
