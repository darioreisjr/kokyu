import type { HabitConsistencyScore } from '../../types/analytics.types';
import type { Habit } from '../../types/habit.types';
import type { HabitLog } from '../../types/log.types';
import { deriveHabitOccurrence } from './habitOccurrenceService';
import { parseDateString } from './habitScheduleEngine';

export function calculateHabitConsistencyScore(
  habit: Habit,
  logs: HabitLog[],
  today: string,
  rollingDays: 30 | 90 = 30,
  weekStartsOn: 0 | 1 = 1,
): HabitConsistencyScore {
  let scheduledCount = 0;
  let completedCount = 0;
  let partialCount = 0;
  let skippedCount = 0;

  let weightedSumCompleted = 0;
  let weightedSumScheduled = 0;

  const todayObj = parseDateString(today);
  const habitStart = parseDateString(habit.startDate);

  for (let i = 0; i < rollingDays; i++) {
    const cur = new Date(todayObj);
    cur.setDate(todayObj.getDate() - i);
    if (cur < habitStart) break;

    const dateStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
    const occ = deriveHabitOccurrence(habit, dateStr, logs, today, weekStartsOn);

    if (occ.isScheduled && !occ.isPaused) {
      // Exponential decay weight: more recent days have higher weight (w = 0.98^i)
      const weight = Math.pow(0.98, i);
      scheduledCount += 1;
      weightedSumScheduled += weight;

      if (occ.status === 'completed') {
        completedCount += 1;
        weightedSumCompleted += weight;
      } else if (occ.status === 'partial') {
        partialCount += 1;
        const partialWeight = (occ.progressPercent / 100) * weight;
        weightedSumCompleted += partialWeight;
      } else if (occ.status === 'skipped') {
        skippedCount += 1;
        // Skipped is neutral: count as partially fulfilled or remove from weighted denominator
        weightedSumScheduled -= weight;
      }
    }
  }

  const score =
    weightedSumScheduled > 0
      ? Math.min(100, Math.round((weightedSumCompleted / weightedSumScheduled) * 100))
      : 100;

  const completionRate =
    scheduledCount > 0
      ? Math.min(100, Math.round((completedCount / (scheduledCount - skippedCount || 1)) * 100))
      : 100;

  return {
    score,
    rollingDays,
    completionRate,
    scheduledCount,
    completedCount,
    partialCount,
    skippedCount,
  };
}
