import type { Goal } from '../types';
import { getGoalProgressSource } from './adapters';
import { clampPercent, type GoalProgressResult } from './progressStrategies/types';
import { getGoalProgressStrategy } from './progressStrategies';

function getMeasurementTarget(goal: Goal): number {
  const measurement = goal.measurement;
  if (
    measurement.type === 'numeric' ||
    measurement.type === 'consistency' ||
    measurement.type === 'average'
  ) {
    return measurement.targetValue;
  }
  return 100;
}

function getMeasurementAllowOverachievement(goal: Goal): boolean {
  const measurement = goal.measurement;
  if (measurement.type === 'numeric' || measurement.type === 'consistency')
    return Boolean(measurement.allowOverachievement);
  return false;
}

/**
 * The single entry point every component/service calls for "what's this goal's progress right
 * now" — never a strategy or an adapter directly. A goal never mixes automatic and manual
 * percent: `progressMode === 'automatic'` always wins over `goal.measurement`/strategies.
 */
export async function calculateGoalProgress(goal: Goal): Promise<GoalProgressResult> {
  if (goal.progressMode === 'automatic' && goal.source) {
    const source = getGoalProgressSource(goal.source.module);
    const result = await source.calculateProgress(goal, goal.source.metricId);
    const target = getMeasurementTarget(goal);
    const allowOverachievement = getMeasurementAllowOverachievement(goal);
    const rawPercent = target === 0 ? 0 : (result.currentValue / target) * 100;
    const percent = clampPercent(rawPercent);
    return {
      current: result.currentValue,
      target,
      percent,
      rawPercent: allowOverachievement ? Math.max(0, Math.round(rawPercent)) : percent,
    };
  }

  const strategy = getGoalProgressStrategy(goal.type);
  return strategy.calculate(goal);
}
