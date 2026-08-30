import { endOfWeek, isWithinInterval, startOfWeek, startOfYear, subDays, subWeeks } from 'date-fns';

import type {
  AdherenceSummary,
  MuscleVolumeEntry,
  TrainingAnalyticsSummary,
  TrendPoint,
  WeeklyConsistencyEntry,
} from '../types';
import { toDateKey } from '../utils/dateHelpers';
import { calculateEstimatedOneRepMax } from './estimatedOneRepMaxCalculator';
import { calculateMuscleVolumeAcrossSessions } from './muscleVolumeCalculator';
import { trainingDb } from './trainingMockDb';

const STREAK_SAFETY_CAP_WEEKS = 104;

/**
 * Every derived training number lives here — never computed inline inside a component (per the
 * spec's own "não calcular volume/PR/progressão dentro do componente"). Field names on
 * `TrainingAnalyticsSummary` deliberately mirror `features/goals`' static training snapshot.
 */
export const trainingAnalyticsService = {
  async getTrainingAnalytics(): Promise<TrainingAnalyticsSummary> {
    const now = new Date();
    const completedSessions = trainingDb.sessions.filter(
      (session) => session.status === 'completed',
    );

    const yearStart = startOfYear(now);
    const sessionsThisYear = completedSessions.filter(
      (session) => new Date(session.startedAt) >= yearStart,
    );
    const minutesTrainedThisYear = Math.round(
      sessionsThisYear.reduce((total, session) => total + (session.durationSeconds ?? 0) / 60, 0),
    );

    const last4WeeksStart = subWeeks(now, 4);
    const sessionsLast4Weeks = completedSessions.filter(
      (session) => new Date(session.startedAt) >= last4WeeksStart,
    );
    const weeklyFrequency = Math.round((sessionsLast4Weeks.length / 4) * 10) / 10;

    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const sessionsThisWeek = completedSessions.filter(
      (session) => new Date(session.startedAt) >= weekStart,
    );
    const totalVolumeThisWeekKg = sessionsThisWeek.reduce((total, session) => {
      const sets = trainingDb.performedSets.filter(
        (set) => set.sessionId === session.id && set.completed && set.setType !== 'warmup',
      );
      return total + sets.reduce((sum, set) => sum + (set.weightKg ?? 0) * (set.reps ?? 0), 0);
    }, 0);

    let currentStreakWeeks = 0;
    for (let weeksAgo = 0; weeksAgo <= STREAK_SAFETY_CAP_WEEKS; weeksAgo += 1) {
      const rangeStart = startOfWeek(subWeeks(now, weeksAgo), { weekStartsOn: 1 });
      const rangeEnd = endOfWeek(rangeStart, { weekStartsOn: 1 });
      const hasSession = completedSessions.some((session) =>
        isWithinInterval(new Date(session.startedAt), { start: rangeStart, end: rangeEnd }),
      );
      if (!hasSession) break;
      currentStreakWeeks += 1;
    }

    return {
      sessionsCompletedThisYear: sessionsThisYear.length,
      minutesTrainedThisYear,
      weeklyFrequency,
      currentStreakWeeks,
      totalVolumeThisWeekKg,
      totalSessions: completedSessions.length,
    };
  },

  async getExerciseTrend(exerciseId: string): Promise<TrendPoint[]> {
    const points: TrendPoint[] = [];
    for (const session of trainingDb.sessions) {
      if (session.status !== 'completed') continue;
      const sessionExercise = session.sessionExercises.find(
        (candidate) => candidate.exerciseId === exerciseId,
      );
      if (!sessionExercise) continue;
      const sets = trainingDb.performedSets.filter(
        (set) =>
          set.sessionExerciseId === sessionExercise.id &&
          set.completed &&
          set.setType !== 'warmup' &&
          typeof set.weightKg === 'number' &&
          typeof set.reps === 'number',
      );
      if (sets.length === 0) continue;
      const bestE1rm = Math.max(
        ...sets.map((set) =>
          calculateEstimatedOneRepMax(set.weightKg!, set.reps!, trainingDb.preferences.e1rmFormula),
        ),
      );
      points.push({ date: session.startedAt.slice(0, 10), value: bestE1rm });
    }
    return points.sort((a, b) => a.date.localeCompare(b.date));
  },

  async getMuscleVolumeBreakdown(rangeDays = 7): Promise<MuscleVolumeEntry[]> {
    const cutoff = subDays(new Date(), rangeDays);
    const sessions = trainingDb.sessions.filter(
      (session) => session.status === 'completed' && new Date(session.startedAt) >= cutoff,
    );
    return calculateMuscleVolumeAcrossSessions(
      sessions,
      trainingDb.performedSets,
      trainingDb.exercises,
    );
  },

  /** `weekStartsOn` should be passed from `features/settings`' `locale.weekStartsOn` by the caller — this service stays hook-free. */
  async getWeeklyConsistency(
    weeksCount = 8,
    weekStartsOn: 0 | 1 = 1,
  ): Promise<WeeklyConsistencyEntry[]> {
    const now = new Date();
    const entries: WeeklyConsistencyEntry[] = [];
    for (let weeksAgo = weeksCount - 1; weeksAgo >= 0; weeksAgo -= 1) {
      const rangeStart = startOfWeek(subWeeks(now, weeksAgo), { weekStartsOn });
      const rangeEnd = endOfWeek(rangeStart, { weekStartsOn });
      const sessionsCompleted = trainingDb.sessions.filter(
        (session) =>
          session.status === 'completed' &&
          isWithinInterval(new Date(session.startedAt), { start: rangeStart, end: rangeEnd }),
      ).length;
      entries.push({ weekStart: toDateKey(rangeStart), sessionsCompleted });
    }
    return entries;
  },

  async getAdherence(programId: string): Promise<AdherenceSummary> {
    const entries = trainingDb.scheduleEntries.filter(
      (entry) => entry.programId === programId && entry.status !== 'rest',
    );
    const plannedCount = entries.length;
    const completedCount = entries.filter((entry) => entry.status === 'completed').length;
    const adherencePercent =
      plannedCount === 0 ? 0 : Math.round((completedCount / plannedCount) * 100);
    return { plannedCount, completedCount, adherencePercent };
  },
};
