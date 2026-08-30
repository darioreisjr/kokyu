import type { Goal, GoalConsistencyMeasurement } from '../../types';
import { clampPercent, type GoalProgressResult, type GoalProgressStrategy } from './types';

/** Same baseline→target math as `numericProgressStrategy`, always moving upward (e.g. "treinar 4x/semana", "90% de consistência"). */
export function calculateConsistencyProgress(goal: Goal): GoalProgressResult {
  const measurement = goal.measurement as GoalConsistencyMeasurement;
  const { baseline, currentValue, targetValue, allowOverachievement } = measurement;
  const span = targetValue - baseline;
  const progressed = currentValue - baseline;
  const rawPercent = span === 0 ? (progressed >= 0 ? 100 : 0) : (progressed / span) * 100;
  const percent = clampPercent(rawPercent);
  return {
    current: currentValue,
    target: targetValue,
    percent,
    rawPercent: allowOverachievement ? Math.max(0, Math.round(rawPercent)) : percent,
  };
}

export const consistencyProgressStrategy: GoalProgressStrategy = {
  type: 'consistency',
  calculate: calculateConsistencyProgress,
};
