import type { DailyHabitScore } from '../../types/analytics.types';
import type { Habit } from '../../types/habit.types';
import type { HabitLog } from '../../types/log.types';
import {
  deriveHabitOccurrence,
  deriveHabitOccurrencesForDate,
} from './habitOccurrenceService';
import {
  getEffectiveScheduleAndTarget,
  getScheduleMonthRange,
  getScheduleWeekRange,
} from './habitScheduleEngine';

export interface HabitPeriodProgress {
  currentValue: number;
  targetValue: number;
  isComplete: boolean;
  percent: number;
}

export function calculateHabitPeriodProgress(
  habit: Habit,
  date: string,
  logs: HabitLog[],
  today: string,
  weekStartsOn: 0 | 1 = 1,
): HabitPeriodProgress {
  const { schedule, target } = getEffectiveScheduleAndTarget(habit, date);

  let periodStart = date;
  let periodEnd = date;

  if (schedule.frequencyType === 'flexibleWeekly') {
    const range = getScheduleWeekRange(date, weekStartsOn);
    periodStart = range.start;
    periodEnd = range.end;
  } else if (schedule.frequencyType === 'flexibleMonthly') {
    const range = getScheduleMonthRange(date);
    periodStart = range.start;
    periodEnd = range.end;
  }

  const periodLogs = logs.filter(
    (l) => l.habitId === habit.id && l.date >= periodStart && l.date <= periodEnd,
  );

  let targetValue = 1;
  let currentValue = 0;

  if (
    schedule.frequencyType === 'flexibleWeekly' ||
    schedule.frequencyType === 'flexibleMonthly'
  ) {
    targetValue = schedule.timesPerPeriod ?? 1;
    // Count distinct dates with successful completion or positive value
    const successfulDates = new Set<string>();
    periodLogs.forEach((log) => {
      if (log.status === 'completed' || log.value > 0) {
        successfulDates.add(log.date);
      }
    });
    currentValue = successfulDates.size;
  } else {
    // Single-day calculation
    const occ = deriveHabitOccurrence(habit, date, logs, today, weekStartsOn);
    if (target.type === 'duration') {
      targetValue = target.targetMinutes;
      currentValue = occ.loggedValue;
    } else if (target.type === 'quantity' || target.type === 'count') {
      targetValue = target.targetValue;
      currentValue = occ.loggedValue;
    } else if (target.type === 'limit') {
      targetValue = target.maxLimit;
      currentValue = occ.loggedValue;
    } else {
      targetValue = 1;
      currentValue = occ.status === 'completed' ? 1 : 0;
    }
  }

  const isComplete =
    target.type === 'limit'
      ? currentValue <= targetValue
      : currentValue >= targetValue;

  const percent =
    targetValue > 0
      ? Math.min(100, Math.round((currentValue / targetValue) * 100))
      : 0;

  return {
    currentValue,
    targetValue,
    isComplete,
    percent,
  };
}

export function calculateDailyHabitScore(
  habits: Habit[],
  date: string,
  logs: HabitLog[],
  today: string,
  weekStartsOn: 0 | 1 = 1,
): DailyHabitScore {
  const occurrences = deriveHabitOccurrencesForDate(
    habits,
    date,
    logs,
    today,
    weekStartsOn,
  );

  // CRITICAL RULE: only scheduled habits that are not paused and not skipped
  const scheduledOccurrences = occurrences.filter(
    (occ) => occ.isScheduled && !occ.isPaused && occ.status !== 'notScheduled',
  );

  const scheduledCount = scheduledOccurrences.length;
  const completedCount = scheduledOccurrences.filter(
    (occ) => occ.status === 'completed',
  ).length;
  const partialCount = scheduledOccurrences.filter(
    (occ) => occ.status === 'partial',
  ).length;
  const skippedCount = scheduledOccurrences.filter(
    (occ) => occ.status === 'skipped',
  ).length;

  // Skipped habits are neutral and removed from denominator
  const effectiveDenominator = Math.max(0, scheduledCount - skippedCount);

  const scorePercent =
    effectiveDenominator > 0
      ? Math.min(100, Math.round((completedCount / effectiveDenominator) * 100))
      : 100;

  return {
    date,
    scorePercent,
    scheduledCount,
    completedCount,
    partialCount,
    skippedCount,
  };
}
