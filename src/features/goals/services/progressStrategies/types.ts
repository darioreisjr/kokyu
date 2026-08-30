import type { Goal, GoalType } from '../../types';

export interface GoalProgressResult {
  current: number;
  target: number;
  /** Clamped 0–100 — what every progress bar/ring renders. */
  percent: number;
  /** Uncapped percent — only differs from `percent` when overachievement is allowed and the real value passed the target. */
  rawPercent: number;
}

/** One implementation per `GoalType` — `GoalProgressEngine` looks these up by type, a component never branches on `GoalType` itself. */
export interface GoalProgressStrategy {
  type: GoalType;
  calculate: (goal: Goal) => GoalProgressResult;
}

/** Shared by every strategy — keeps `percent` a valid progress-bar value while `rawPercent` can still tell the truth. */
export function clampPercent(rawPercent: number): number {
  return Math.max(0, Math.min(100, Math.round(rawPercent)));
}
