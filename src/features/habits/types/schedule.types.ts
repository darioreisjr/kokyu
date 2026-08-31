import type { HabitTarget } from './habit.types';

/**
 * Frequency types supported by Kokyu's schedule engine:
 * - 'daily': Every day
 * - 'specificDays': Specific weekdays (e.g. Mon, Wed, Fri)
 * - 'flexibleWeekly': X times per week (any X days satisfy the week)
 * - 'flexibleMonthly': X times per month (any X days satisfy the month)
 * - 'interval': Every N days (e.g. every 2 days)
 * - 'weekdays': Monday to Friday
 * - 'weekends': Saturday and Sunday
 * - 'custom': Custom repeat patterns
 */
export type HabitFrequencyType =
  | 'daily'
  | 'specificDays'
  | 'flexibleWeekly'
  | 'flexibleMonthly'
  | 'interval'
  | 'weekdays'
  | 'weekends'
  | 'custom';

export interface HabitSchedule {
  frequencyType: HabitFrequencyType;
  /** 0 = Sunday, 1 = Monday, ..., 6 = Saturday (matching Date#getDay()) */
  weekdays?: number[];
  /** For flexibleWeekly (e.g. 3 times) or flexibleMonthly (e.g. 10 times) */
  timesPerPeriod?: number;
  period?: 'week' | 'month';
  /** For interval schedules (e.g. every 2 days) */
  intervalDays?: number;
  /** Effective date from which this schedule applies ("yyyy-MM-dd") */
  effectiveFrom: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Historical version of a schedule — whenever a habit's frequency or target is edited,
 * a snapshot is created with an `effectiveUntil` date so past analytics are preserved intact.
 */
export interface HabitScheduleVersion {
  versionId: string;
  effectiveFrom: string; // "yyyy-MM-dd"
  effectiveUntil?: string; // "yyyy-MM-dd"
  schedule: HabitSchedule;
  target: HabitTarget;
}

