export type MissionRecurrenceFrequency =
  | 'daily'
  | 'weekdays'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'specificWeekdays'
  | 'customInterval';

/**
 * `scheduledDate`: next occurrence is computed from the previous occurrence's planned/deadline date.
 * `completionDate`: next occurrence is computed from when the mission was actually completed
 * (e.g. "30 days after completing").
 */
export type MissionRecurrenceBasis = 'scheduledDate' | 'completionDate';

export interface MissionRecurrenceRule {
  frequency: MissionRecurrenceFrequency;
  /** Only meaningful for `customInterval` — every N days. */
  intervalDays?: number;
  /** Only meaningful for `specificWeekdays` — 0 (Sunday) to 6 (Saturday). */
  weekdays?: number[];
  basis: MissionRecurrenceBasis;
  endDate?: string;
  occurrenceCount?: number;
}

/**
 * Prepared for future editing scope (spec "EXCEPTION FUTURA"): whether an edit to a recurring
 * mission applies to just this occurrence, this-and-future, or the whole series. Not surfaced in
 * the UI yet — `missionRecurrenceEngine` only ever generates the next single occurrence today.
 */
export type MissionRecurrenceEditScope = 'thisOccurrence' | 'thisAndFuture' | 'entireSeries';
