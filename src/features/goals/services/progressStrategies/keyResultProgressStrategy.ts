import type { Goal, GoalKeyResult } from '../../types';
import { clampPercent, type GoalProgressResult, type GoalProgressStrategy } from './types';

function calculateKeyResultPercent(keyResult: GoalKeyResult): number {
  if (keyResult.type === 'binary') return keyResult.status === 'completed' ? 100 : 0;
  const span = keyResult.target - keyResult.baseline;
  const progressed = keyResult.current - keyResult.baseline;
  const rawPercent = span === 0 ? (progressed >= 0 ? 100 : 0) : (progressed / span) * 100;
  return clampPercent(rawPercent);
}

/**
 * A goal using key results never keeps a separate manual/automatic percent — this is the *only*
 * source of its progress (see the spec's "não manter percentual manual e automático
 * simultaneamente"). Equal weight when none of the key results has its own `weight`.
 */
export function calculateKeyResultProgress(goal: Goal): GoalProgressResult {
  const keyResults = goal.keyResults ?? [];
  if (keyResults.length === 0) return { current: 0, target: 0, percent: 0, rawPercent: 0 };

  const allWeighted = keyResults.every((keyResult) => typeof keyResult.weight === 'number');
  const totalWeight = allWeighted
    ? keyResults.reduce((sum, keyResult) => sum + (keyResult.weight ?? 0), 0)
    : keyResults.length;
  const weightedPercentSum = keyResults.reduce((sum, keyResult) => {
    const weight = allWeighted ? (keyResult.weight ?? 0) : 1;
    return sum + weight * calculateKeyResultPercent(keyResult);
  }, 0);

  const rawPercent = totalWeight === 0 ? 0 : weightedPercentSum / totalWeight;
  const percent = clampPercent(rawPercent);
  return { current: percent, target: 100, percent, rawPercent: percent };
}

export const keyResultProgressStrategy: GoalProgressStrategy = {
  type: 'keyResult',
  calculate: calculateKeyResultProgress,
};
