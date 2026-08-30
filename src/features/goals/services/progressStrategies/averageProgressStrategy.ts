import type { Goal, GoalAverageMeasurement } from '../../types';
import { clampPercent, type GoalProgressResult, type GoalProgressStrategy } from './types';

/**
 * `currentValue` here is already the rolling average over `periodDays` — recomputed by
 * `goalProgressEngine` whenever a progress entry is added, never inside this strategy (it stays a
 * plain, testable current/target comparison).
 */
export function calculateAverageProgress(goal: Goal): GoalProgressResult {
  const measurement = goal.measurement as GoalAverageMeasurement;
  const { currentValue, targetValue } = measurement;
  const rawPercent = targetValue === 0 ? 0 : (currentValue / targetValue) * 100;
  const percent = clampPercent(rawPercent);
  return {
    current: currentValue,
    target: targetValue,
    percent,
    rawPercent: Math.max(0, Math.round(rawPercent)),
  };
}

export const averageProgressStrategy: GoalProgressStrategy = {
  type: 'average',
  calculate: calculateAverageProgress,
};
