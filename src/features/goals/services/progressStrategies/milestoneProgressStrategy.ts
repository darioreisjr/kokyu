import type { Goal } from '../../types';
import { clampPercent, type GoalProgressResult, type GoalProgressStrategy } from './types';

/**
 * Equal weight per milestone unless every milestone on the goal has its own `weight` — a mix of
 * weighted and unweighted milestones falls back to equal weight rather than guessing which ones
 * to treat as zero.
 */
export function calculateMilestoneProgress(goal: Goal): GoalProgressResult {
  const milestones = goal.milestones ?? [];
  if (milestones.length === 0) return { current: 0, target: 0, percent: 0, rawPercent: 0 };

  const allWeighted = milestones.every((milestone) => typeof milestone.weight === 'number');
  const totalWeight = allWeighted
    ? milestones.reduce((sum, milestone) => sum + (milestone.weight ?? 0), 0)
    : milestones.length;
  const completedWeight = milestones.reduce((sum, milestone) => {
    if (!milestone.completed) return sum;
    return sum + (allWeighted ? (milestone.weight ?? 0) : 1);
  }, 0);

  const rawPercent = totalWeight === 0 ? 0 : (completedWeight / totalWeight) * 100;
  const percent = clampPercent(rawPercent);
  return { current: completedWeight, target: totalWeight, percent, rawPercent: percent };
}

export const milestoneProgressStrategy: GoalProgressStrategy = {
  type: 'milestone',
  calculate: calculateMilestoneProgress,
};
