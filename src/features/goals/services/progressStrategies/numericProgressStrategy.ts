import type { Goal, GoalNumericMeasurement } from '../../types';
import { clampPercent, type GoalProgressResult, type GoalProgressStrategy } from './types';

/**
 * Covers "value", "reduction" (`direction: 'decrease'`), "cumulative" and "percentage" goals —
 * all the same baseline→target math, just walked in the direction the goal actually moves.
 */
export function calculateNumericProgress(goal: Goal): GoalProgressResult {
  const measurement = goal.measurement as GoalNumericMeasurement;
  const { baseline, currentValue, targetValue, direction, allowOverachievement } = measurement;
  const span = direction === 'increase' ? targetValue - baseline : baseline - targetValue;
  const progressed = direction === 'increase' ? currentValue - baseline : baseline - currentValue;
  const rawPercent = span === 0 ? (progressed >= 0 ? 100 : 0) : (progressed / span) * 100;
  const percent = clampPercent(rawPercent);
  return {
    current: currentValue,
    target: targetValue,
    percent,
    rawPercent: allowOverachievement ? Math.max(0, Math.round(rawPercent)) : percent,
  };
}

export const numericProgressStrategy: GoalProgressStrategy = {
  type: 'numeric',
  calculate: calculateNumericProgress,
};
