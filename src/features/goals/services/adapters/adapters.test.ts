import { describe, expect, it } from 'vitest';

import type { Goal } from '../../types';
import { habitGoalAdapter } from './habitGoalAdapter';
import { getAllGoalProgressSources, getGoalProgressSource } from './index';
import { leisureGoalAdapter } from './leisureGoalAdapter';
import { missionGoalAdapter } from './missionGoalAdapter';
import { nutritionGoalAdapter } from './nutritionGoalAdapter';
import { trainingGoalAdapter } from './trainingGoalAdapter';

const placeholderGoal = {} as Goal;

describe('adapters — every module returns 0 with no detail for an unknown metric id', () => {
  const adapters = [
    leisureGoalAdapter,
    trainingGoalAdapter,
    nutritionGoalAdapter,
    habitGoalAdapter,
    missionGoalAdapter,
  ];

  it.each(adapters.map((adapter) => [adapter.module, adapter] as const))(
    '%s adapter',
    async (_module, adapter) => {
      const result = await adapter.calculateProgress(placeholderGoal, 'not-a-real-metric');
      expect(result.currentValue).toBe(0);
      expect(result.detail).toBeUndefined();
    },
  );

  it.each(adapters.map((adapter) => [adapter.module, adapter] as const))(
    '%s adapter reports every declared metric with a detail string',
    async (_module, adapter) => {
      for (const metric of adapter.metrics) {
        const result = await adapter.calculateProgress(placeholderGoal, metric.id);
        expect(result.unit).toBe(metric.unit);
        expect(result.detail).toBeDefined();
      }
    },
  );
});

describe('getGoalProgressSource / getAllGoalProgressSources', () => {
  it('registers all 5 modules', () => {
    expect(getAllGoalProgressSources()).toHaveLength(5);
  });

  it('resolves a specific module', () => {
    expect(getGoalProgressSource('leisure')).toBe(leisureGoalAdapter);
  });
});
