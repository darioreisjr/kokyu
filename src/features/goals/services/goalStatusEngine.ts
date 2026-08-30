import type { Goal, GoalMilestone } from '../types';
import { GOAL_STATUS_THRESHOLDS } from './goalStatusThresholds';

/** Only the 4 "health" states — lifecycle states (completed/paused/abandoned/archived) are set explicitly by `goalService`, never inferred here. */
export type GoalHealthStatus = 'notStarted' | 'onTrack' | 'attention' | 'atRisk';

function toDateOnly(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00`);
}

function weightedMilestoneExpectedProgress(milestones: GoalMilestone[], now: Date): number | null {
  const dated = milestones.filter((milestone) => Boolean(milestone.targetDate));
  if (dated.length === 0) return null;

  const allWeighted = dated.every((milestone) => typeof milestone.weight === 'number');
  const totalWeight = allWeighted
    ? dated.reduce((sum, milestone) => sum + (milestone.weight ?? 0), 0)
    : dated.length;
  if (totalWeight === 0) return null;

  const dueWeight = dated.reduce((sum, milestone) => {
    const isDue = toDateOnly(milestone.targetDate!).getTime() <= now.getTime();
    if (!isDue) return sum;
    return sum + (allWeighted ? (milestone.weight ?? 0) : 1);
  }, 0);

  return Math.max(0, Math.min(100, Math.round((dueWeight / totalWeight) * 100)));
}

/**
 * Linear by default (`startDate` → `targetDate`) — the pace a goal "should" be at today if
 * progress moved at a constant rate. `milestone` goals use their own milestones' due dates
 * instead of a straight time fraction, since a project rarely progresses linearly. Returns `null`
 * when there's no deadline at all — pace can't be assessed without one.
 */
export function calculateExpectedProgress(goal: Goal, now: Date = new Date()): number | null {
  if (!goal.targetDate) return null;

  if (goal.type === 'milestone' && goal.milestones && goal.milestones.length > 0) {
    const milestoneExpected = weightedMilestoneExpectedProgress(goal.milestones, now);
    if (milestoneExpected !== null) return milestoneExpected;
  }

  const start = toDateOnly(goal.startDate).getTime();
  const target = toDateOnly(goal.targetDate).getTime();
  if (target <= start) return 100;

  const elapsed = now.getTime() - start;
  const totalSpan = target - start;
  return Math.max(0, Math.min(100, Math.round((elapsed / totalSpan) * 100)));
}

/**
 * Compares real progress against `calculateExpectedProgress` using centralized thresholds. A goal
 * with no deadline or no expected-progress signal is always `onTrack` — there's nothing to fall
 * behind on. Never returns a lifecycle state; see `GoalHealthStatus`.
 */
export function calculateGoalStatus(
  percent: number,
  expectedPercent: number | null,
  hasStarted: boolean,
): GoalHealthStatus {
  if (!hasStarted && percent <= 0) return 'notStarted';
  if (expectedPercent === null) return 'onTrack';

  const gap = expectedPercent - percent;
  if (gap >= GOAL_STATUS_THRESHOLDS.atRiskGapPoints) return 'atRisk';
  if (gap >= GOAL_STATUS_THRESHOLDS.attentionGapPoints) return 'attention';
  return 'onTrack';
}
