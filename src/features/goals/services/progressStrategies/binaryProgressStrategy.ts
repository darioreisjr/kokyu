import type { Goal, GoalBinaryMeasurement } from '../../types';
import type { GoalProgressResult, GoalProgressStrategy } from './types';

export function calculateBinaryProgress(goal: Goal): GoalProgressResult {
  const measurement = goal.measurement as GoalBinaryMeasurement;
  const percent = measurement.completed ? 100 : 0;
  return { current: percent, target: 100, percent, rawPercent: percent };
}

export const binaryProgressStrategy: GoalProgressStrategy = {
  type: 'binary',
  calculate: calculateBinaryProgress,
};
