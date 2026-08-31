import type { HabitStreak } from '../../types/analytics.types';
import type { Habit } from '../../types/habit.types';
import type { HabitLog } from '../../types/log.types';
import { deriveHabitOccurrence } from './habitOccurrenceService';
import { getScheduleWeekRange, parseDateString } from './habitScheduleEngine';

export function calculateHabitStreak(
  habit: Habit,
  logs: HabitLog[],
  today: string,
  weekStartsOn: 0 | 1 = 1,
): HabitStreak {
  const { frequencyType } = habit.schedule;

  if (frequencyType === 'flexibleWeekly') {
    return calculateFlexibleWeeklyStreak(habit, logs, today, weekStartsOn);
  }

  // Daily or specific days streak calculation
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  let lastCompletedDate: string | undefined;

  const habitStartDate = habit.startDate;
  const cursorDate = parseDateString(today);
  const earliestDate = parseDateString(habitStartDate);

  // Traverse backwards from today to find currentStreak
  let isCurrentStreakBroken = false;
  const todayOcc = deriveHabitOccurrence(habit, today, logs, today, weekStartsOn);

  const checkDate = new Date(cursorDate);

  // If today is scheduled and not completed yet, start evaluating from yesterday
  if (todayOcc.isScheduled && todayOcc.status !== 'completed' && todayOcc.status !== 'skipped') {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (checkDate >= earliestDate) {
    const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    const occ = deriveHabitOccurrence(habit, dateStr, logs, today, weekStartsOn);

    if (occ.isScheduled && !occ.isPaused) {
      if (occ.status === 'completed') {
        if (!isCurrentStreakBroken) {
          currentStreak += 1;
          if (!lastCompletedDate) {
            lastCompletedDate = dateStr;
          }
        }
      } else if (occ.status === 'skipped') {
        // Neutral skip does not break streak
      } else {
        // Missed breaks the current streak
        isCurrentStreakBroken = true;
      }
    }

    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Calculate best streak historically
  const forwardDate = new Date(earliestDate);
  const endToday = parseDateString(today);

  while (forwardDate <= endToday) {
    const dateStr = `${forwardDate.getFullYear()}-${String(forwardDate.getMonth() + 1).padStart(2, '0')}-${String(forwardDate.getDate()).padStart(2, '0')}`;
    const occ = deriveHabitOccurrence(habit, dateStr, logs, today, weekStartsOn);

    if (occ.isScheduled && !occ.isPaused) {
      if (occ.status === 'completed') {
        tempStreak += 1;
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }
      } else if (occ.status === 'skipped') {
        // Neutral skip
      } else {
        tempStreak = 0;
      }
    }

    forwardDate.setDate(forwardDate.getDate() + 1);
  }

  if (currentStreak > bestStreak) {
    bestStreak = currentStreak;
  }

  return {
    currentStreak,
    bestStreak,
    lastCompletedDate,
    periodUnit: 'days',
  };
}

function calculateFlexibleWeeklyStreak(
  habit: Habit,
  logs: HabitLog[],
  today: string,
  weekStartsOn: 0 | 1 = 1,
): HabitStreak {
  const timesTarget = habit.schedule.timesPerPeriod ?? 1;
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  let lastCompletedDate: string | undefined;

  // Evaluate weekly periods backwards
  let currentWeek = getScheduleWeekRange(today, weekStartsOn);
  let isCurrentStreakBroken = false;
  const earliestDate = habit.startDate;

  // Loop back 52 weeks max
  for (let w = 0; w < 52; w++) {
    if (currentWeek.end < earliestDate) break;

    const weekLogs = logs.filter(
      (l) => l.habitId === habit.id && l.date >= currentWeek.start && l.date <= currentWeek.end,
    );

    const completedDates = new Set<string>();
    weekLogs.forEach((l) => {
      if (l.status === 'completed' || l.value > 0) {
        completedDates.add(l.date);
      }
    });

    const isWeekMet = completedDates.size >= timesTarget;
    const isCurrentOngoingWeek = today >= currentWeek.start && today <= currentWeek.end;

    if (isWeekMet) {
      if (!isCurrentStreakBroken) {
        currentStreak += 1;
        if (!lastCompletedDate) {
          lastCompletedDate = currentWeek.end;
        }
      }
      tempStreak += 1;
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    } else {
      if (!isCurrentOngoingWeek) {
        isCurrentStreakBroken = true;
        tempStreak = 0;
      }
    }

    // Move to previous week
    const prevDate = parseDateString(currentWeek.start);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`;
    currentWeek = getScheduleWeekRange(prevDateStr, weekStartsOn);
  }

  if (currentStreak > bestStreak) {
    bestStreak = currentStreak;
  }

  return {
    currentStreak,
    bestStreak,
    lastCompletedDate,
    periodUnit: 'weeks',
  };
}
