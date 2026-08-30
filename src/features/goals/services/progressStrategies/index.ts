import type { GoalType } from '../../types';
import { averageProgressStrategy } from './averageProgressStrategy';
import { binaryProgressStrategy } from './binaryProgressStrategy';
import { consistencyProgressStrategy } from './consistencyProgressStrategy';
import { keyResultProgressStrategy } from './keyResultProgressStrategy';
import { milestoneProgressStrategy } from './milestoneProgressStrategy';
import { numericProgressStrategy } from './numericProgressStrategy';
import type { GoalProgressStrategy } from './types';

/** `GoalType → GoalProgressStrategy` — the one place that knows every strategy exists. */
const goalProgressStrategies: Record<GoalType, GoalProgressStrategy> = {
  numeric: numericProgressStrategy,
  binary: binaryProgressStrategy,
  milestone: milestoneProgressStrategy,
  consistency: consistencyProgressStrategy,
  average: averageProgressStrategy,
  keyResult: keyResultProgressStrategy,
};

export function getGoalProgressStrategy(type: GoalType): GoalProgressStrategy {
  return goalProgressStrategies[type];
}

export type { GoalProgressResult, GoalProgressStrategy } from './types';
