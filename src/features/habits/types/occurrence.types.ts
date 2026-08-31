import type { Habit, HabitTarget } from './habit.types';
import type { HabitLog, HabitLogStatus } from './log.types';

/**
 * Derived domain object representing what was scheduled vs what actually happened on a specific date/period.
 * Eliminates the need to persist thousands of fake "missed" rows.
 */
export interface HabitOccurrence {
  habitId: string;
  habit: Habit;
  date: string; // "yyyy-MM-dd"
  periodStart: string;
  periodEnd: string;
  isScheduled: boolean;
  isPaused: boolean;
  target: HabitTarget;
  loggedValue: number;
  logs: HabitLog[];
  status: HabitLogStatus;
  progressPercent: number;
  /** For reduce / limit habits */
  isWithinLimit?: boolean;
  remainingForTarget?: number;
}

