import { calculateGoalProgress } from '@/features/goals/services/goalProgressEngine';
import { goalService } from '@/features/goals/services/goalService';
import type { Goal } from '@/features/goals/types';
import type {
  GoalHomeProjection,
  HomeGoalStatus,
  HomeGoalSummary,
  HomeProviderContext,
  HomeSectionProvider,
} from '@/shared/home/types';

const LIFECYCLE_INACTIVE: HomeGoalStatus[] = ['completed', 'paused', 'abandoned', 'archived'];

async function toSummary(goal: Goal): Promise<HomeGoalSummary> {
  const progress = await calculateGoalProgress(goal);
  const nextMilestone = [...(goal.milestones ?? [])]
    .filter((milestone) => !milestone.completed)
    .sort((a, b) => a.order - b.order)[0];

  return {
    id: goal.id,
    title: goal.title,
    status: goal.status,
    progressPercent: progress.percent,
    nextMilestoneTitle: nextMilestone?.title,
  };
}

/**
 * Reads `goalService`/`goalProgressEngine` — the same services the Metas
 * pages read, `status`/`systemStatus` always freshly recalculated by
 * `goalService.getGoals()` itself (see `docs/goals.md`). Never a copy of
 * `Goal` — only this projection, exactly the seam `docs/goals.md:196-198`
 * reserved for this page ("Metas em foco").
 */
export const goalHomeProvider: HomeSectionProvider<GoalHomeProjection> = {
  sourceType: 'goal',
  label: 'Metas',

  async getHomeProjection(context: HomeProviderContext): Promise<GoalHomeProjection> {
    const [goals, pendingCheckIns] = await Promise.all([
      goalService.getGoals(),
      goalService.getPendingCheckIns(context.now),
    ]);

    const active = goals.filter((goal) => !LIFECYCLE_INACTIVE.includes(goal.status));

    const focusGoals = active
      .filter((goal) => goal.priority === 'focus')
      .sort((a, b) => (a.targetDate ?? '9999-99-99').localeCompare(b.targetDate ?? '9999-99-99'))
      .slice(0, 2);

    const focusIds = new Set(focusGoals.map((goal) => goal.id));
    const atRiskGoals = active.filter((goal) => goal.status === 'atRisk' && !focusIds.has(goal.id)).slice(0, 2);

    const [inFocus, atRisk] = await Promise.all([
      Promise.all(focusGoals.map(toSummary)),
      Promise.all(atRiskGoals.map(toSummary)),
    ]);

    return {
      inFocus,
      atRisk,
      pendingCheckIns: pendingCheckIns.length,
    };
  },
};
