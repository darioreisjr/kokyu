export type GoalProgressEntrySource =
  'manual' | 'mission' | 'habit' | 'training' | 'nutrition' | 'leisure' | 'system';

/**
 * One row per progress update — `Goal.measurement.currentValue` is never overwritten without a
 * trace. This is what powers the pace chart and the progress history list.
 */
export interface GoalProgressEntry {
  id: string;
  goalId: string;
  value: number;
  /** `yyyy-MM-dd`. */
  date: string;
  note?: string;
  source: GoalProgressEntrySource;
  /** The originating entity in another module, when `source` isn't `manual` — audit only, never resolved back into that module's UI. */
  entityId?: string;
  createdAt: string;
}
