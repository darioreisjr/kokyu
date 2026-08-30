import type { Goal, GoalSourceModule, GoalUnit } from './goal.types';

/** One selectable automatic metric — e.g. "Livros concluídos" under the `leisure` module. */
export interface GoalSourceMetric {
  id: string;
  module: GoalSourceModule;
  label: string;
  description?: string;
  unit: GoalUnit;
}

export interface GoalProgressSourceResult {
  currentValue: number;
  unit: GoalUnit;
  lastSyncAt: string;
  /** A short human-readable breakdown, e.g. "8 livros concluídos em 2026". */
  detail?: string;
}

/**
 * The contract every automatic-progress adapter implements — `GoalCard`/`GoalProgressEngine`
 * never know which module they're talking to, only that they can call `calculateProgress`.
 */
export interface GoalProgressSource {
  module: GoalSourceModule;
  metrics: GoalSourceMetric[];
  calculateProgress: (goal: Goal, metricId: string) => Promise<GoalProgressSourceResult>;
}
