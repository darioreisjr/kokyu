import type { Habit } from '../../types/habit.types';
import type { HabitLog, HabitLogStatus } from '../../types/log.types';
import type { HabitOccurrence } from '../../types/occurrence.types';
import {
  getEffectiveScheduleAndTarget,
  getScheduleMonthRange,
  getScheduleWeekRange,
  isHabitPausedOnDate,
  isHabitScheduledOnDate,
  parseDateString,
} from './habitScheduleEngine';

export function deriveHabitOccurrence(
  habit: Habit,
  date: string,
  logs: HabitLog[],
  today: string,
  weekStartsOn: 0 | 1 = 1,
): HabitOccurrence {
  const isScheduled = isHabitScheduledOnDate(habit, date);
  const isPaused = isHabitPausedOnDate(habit, date);
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

  const dayLogs = logs.filter(
    (log) => log.habitId === habit.id && log.date === date,
  );

  const hasSkipped = dayLogs.some((l) => l.status === 'skipped');

  if (hasSkipped) {
    return {
      habitId: habit.id,
      habit,
      date,
      periodStart,
      periodEnd,
      isScheduled,
      isPaused,
      target,
      loggedValue: 0,
      logs: dayLogs,
      status: 'skipped',
      progressPercent: 0,
    };
  }

  if (isPaused) {
    return {
      habitId: habit.id,
      habit,
      date,
      periodStart,
      periodEnd,
      isScheduled: false,
      isPaused: true,
      target,
      loggedValue: dayLogs.reduce((acc, log) => acc + log.value, 0),
      logs: dayLogs,
      status: 'notScheduled',
      progressPercent: 0,
    };
  }

  if (!isScheduled) {
    const loggedVal = dayLogs.reduce((acc, log) => acc + log.value, 0);
    return {
      habitId: habit.id,
      habit,
      date,
      periodStart,
      periodEnd,
      isScheduled: false,
      isPaused: false,
      target,
      loggedValue: loggedVal,
      logs: dayLogs,
      status: loggedVal > 0 ? 'completed' : 'notScheduled',
      progressPercent: loggedVal > 0 ? 100 : 0,
    };
  }

  // Evaluate based on Target Type
  switch (target.type) {
    case 'binary': {
      const hasCompleted = dayLogs.some((l) => l.status === 'completed' && l.value >= 1);
      const isPast = date < today;
      let status: HabitLogStatus;

      if (hasCompleted) {
        status = 'completed';
      } else if (isPast) {
        status = 'missed';
      } else {
        status = 'partial'; // pending for today
      }

      return {
        habitId: habit.id,
        habit,
        date,
        periodStart,
        periodEnd,
        isScheduled: true,
        isPaused: false,
        target,
        loggedValue: hasCompleted ? 1 : 0,
        logs: dayLogs,
        status,
        progressPercent: hasCompleted ? 100 : 0,
      };
    }

    case 'duration': {
      const targetMins = target.targetMinutes;
      const minMins = target.minimumMinutes ?? targetMins;
      const totalLogged = dayLogs.reduce((acc, log) => acc + log.value, 0);
      const isComplete = totalLogged >= targetMins;
      const isPast = date < today;

      let status: HabitLogStatus;
      if (isComplete) {
        status = 'completed';
      } else if (totalLogged >= minMins) {
        status = 'partial';
      } else if (totalLogged > 0) {
        status = 'partial';
      } else if (isPast) {
        status = 'missed';
      } else {
        status = 'partial';
      }

      const percent = targetMins > 0 ? Math.round((totalLogged / targetMins) * 100) : 0;

      return {
        habitId: habit.id,
        habit,
        date,
        periodStart,
        periodEnd,
        isScheduled: true,
        isPaused: false,
        target,
        loggedValue: totalLogged,
        logs: dayLogs,
        status,
        progressPercent: percent,
      };
    }

    case 'count':
    case 'quantity': {
      const targetVal = target.targetValue;
      const totalLogged = dayLogs.reduce((acc, log) => acc + log.value, 0);
      const isComplete = totalLogged >= targetVal;

      let status: HabitLogStatus;
      if (isComplete) {
        status = 'completed';
      } else if (totalLogged > 0) {
        status = 'partial';
      } else if (date < today) {
        status = 'missed';
      } else {
        status = 'partial';
      }

      const allowOver = target.type === 'quantity' ? target.allowOverachievement ?? true : false;
      const rawPercent = targetVal > 0 ? Math.round((totalLogged / targetVal) * 100) : 0;
      const progressPercent = allowOver ? rawPercent : Math.min(100, rawPercent);

      return {
        habitId: habit.id,
        habit,
        date,
        periodStart,
        periodEnd,
        isScheduled: true,
        isPaused: false,
        target,
        loggedValue: totalLogged,
        logs: dayLogs,
        status,
        progressPercent,
      };
    }

    case 'limit': {
      const maxLimit = target.maxLimit;
      const totalLogged = dayLogs.reduce((acc, log) => acc + log.value, 0);
      const isWithinLimit = totalLogged <= maxLimit;
      const isPast = date < today;

      let status: HabitLogStatus;
      if (isWithinLimit) {
        status = 'completed';
      } else {
        status = isPast ? 'missed' : 'partial';
      }

      return {
        habitId: habit.id,
        habit,
        date,
        periodStart,
        periodEnd,
        isScheduled: true,
        isPaused: false,
        target,
        loggedValue: totalLogged,
        logs: dayLogs,
        status,
        progressPercent: isWithinLimit ? 100 : 0,
        isWithinLimit,
      };
    }

    case 'automatic':
    default: {
      const totalLogged = dayLogs.reduce((acc, log) => acc + log.value, 0);
      const targetVal = target.targetValue ?? 1;
      const isComplete = totalLogged >= targetVal;

      return {
        habitId: habit.id,
        habit,
        date,
        periodStart,
        periodEnd,
        isScheduled: true,
        isPaused: false,
        target,
        loggedValue: totalLogged,
        logs: dayLogs,
        status: isComplete ? 'completed' : 'partial',
        progressPercent: Math.min(100, Math.round((totalLogged / targetVal) * 100)),
      };
    }
  }
}

export function deriveHabitOccurrencesForDate(
  habits: Habit[],
  date: string,
  logs: HabitLog[],
  today: string,
  weekStartsOn: 0 | 1 = 1,
): HabitOccurrence[] {
  return habits
    .filter((h) => h.status !== 'archived')
    .map((habit) => deriveHabitOccurrence(habit, date, logs, today, weekStartsOn));
}

export function deriveHabitOccurrencesForDateRange(
  habit: Habit,
  startDate: string,
  endDate: string,
  logs: HabitLog[],
  today: string,
  weekStartsOn: 0 | 1 = 1,
): HabitOccurrence[] {
  const occurrences: HabitOccurrence[] = [];
  const current = parseDateString(startDate);
  const end = parseDateString(endDate);

  while (current <= end) {
    const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
    occurrences.push(deriveHabitOccurrence(habit, dateStr, logs, today, weekStartsOn));
    current.setDate(current.getDate() + 1);
  }

  return occurrences;
}
