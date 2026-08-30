import type { Goal } from '../types';
import { fromDateKey } from './dateHelpers';

export type GoalHorizon = 'now' | 'month' | 'quarter' | 'year' | 'longTerm' | 'noDeadline';

export const goalHorizonLabels: Record<GoalHorizon, string> = {
  now: 'Agora',
  month: 'Este mês',
  quarter: 'Este trimestre',
  year: 'Este ano',
  longTerm: 'Longo prazo',
  noDeadline: 'Sem prazo definido',
};

/** Derived from `targetDate`, never something the user has to pick separately — "não obrigar todos a usar trimestre". */
export function getGoalHorizon(goal: Goal, now: Date = new Date()): GoalHorizon {
  if (!goal.targetDate) return 'noDeadline';
  const days = Math.floor(
    (fromDateKey(goal.targetDate).getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (days <= 7) return 'now';
  if (days <= 31) return 'month';
  if (days <= 92) return 'quarter';
  if (days <= 366) return 'year';
  return 'longTerm';
}

/** How far along `startDate` → `targetDate` today is, 0–1 — purely for the simplified desktop timeline visual, not the status engine's own pace math. */
export function getGoalTimelineFraction(goal: Goal, now: Date = new Date()): number | null {
  if (!goal.targetDate) return null;
  const start = fromDateKey(goal.startDate).getTime();
  const target = fromDateKey(goal.targetDate).getTime();
  if (target <= start) return 1;
  return Math.max(0, Math.min(1, (now.getTime() - start) / (target - start)));
}
