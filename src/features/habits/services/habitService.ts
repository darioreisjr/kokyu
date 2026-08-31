import type { HabitsOverviewAnalytics } from '../types/analytics.types';
import type { Habit, HabitPlannedPause } from '../types/habit.types';
import type { HabitLog } from '../types/log.types';
import type { HabitOccurrence } from '../types/occurrence.types';
import type { HabitReview } from '../types/review.types';
import type { HabitRoutine } from '../types/routine.types';
import type { HabitScheduleVersion } from '../types/schedule.types';
import { getHabitsOverviewAnalytics } from './engines/habitAnalyticsService';
import {
  deriveHabitOccurrence,
  deriveHabitOccurrencesForDate,
} from './engines/habitOccurrenceService';
import { generateId, habitDb } from './habitMockDb';

export type HabitInput = Omit<
  Habit,
  'id' | 'createdAt' | 'updatedAt' | 'archivedAt' | 'pausedAt' | 'scheduleHistory'
>;

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]!;
}

export const habitService = {
  async getHabits(): Promise<Habit[]> {
    return [...habitDb.habits];
  },

  async getHabit(id: string): Promise<Habit | null> {
    const habit = habitDb.habits.find((h) => h.id === id);
    return habit ? { ...habit } : null;
  },

  async createHabit(input: HabitInput): Promise<Habit> {
    const now = new Date().toISOString();
    const habit: Habit = {
      ...input,
      id: generateId('habit'),
      status: input.status ?? 'active',
      createdAt: now,
      updatedAt: now,
    };
    habitDb.habits.push(habit);
    return { ...habit };
  },

  async updateHabit(
    id: string,
    patch: Partial<HabitInput>,
    options?: { effectiveDate?: string },
  ): Promise<Habit | null> {
    const index = habitDb.habits.findIndex((h) => h.id === id);
    if (index === -1) return null;

    const existing = habitDb.habits[index]!;
    const now = new Date().toISOString();
    const today = getTodayString();
    const effectiveDate = options?.effectiveDate ?? today;

    const scheduleHistory = existing.scheduleHistory ? [...existing.scheduleHistory] : [];

    // If schedule or target changed and effectiveDate is provided, create a historical version
    const scheduleChanged = patch.schedule && JSON.stringify(patch.schedule) !== JSON.stringify(existing.schedule);
    const targetChanged = patch.target && JSON.stringify(patch.target) !== JSON.stringify(existing.target);

    if (scheduleChanged || targetChanged) {
      // Calculate yesterday before effectiveDate
      const [y, m, d] = effectiveDate.split('-').map(Number);
      const prevDay = new Date(y!, m! - 1, d! - 1);
      const prevDayStr = `${prevDay.getFullYear()}-${String(prevDay.getMonth() + 1).padStart(2, '0')}-${String(prevDay.getDate()).padStart(2, '0')}`;

      const version: HabitScheduleVersion = {
        versionId: generateId('ver'),
        effectiveFrom: existing.schedule.effectiveFrom ?? existing.startDate,
        effectiveUntil: prevDayStr,
        schedule: { ...existing.schedule },
        target: { ...existing.target },
      };

      scheduleHistory.push(version);
    }

    const updated: Habit = {
      ...existing,
      ...patch,
      scheduleHistory,
      updatedAt: now,
    };

    habitDb.habits[index] = updated;
    return { ...updated };
  },

  async duplicateHabit(id: string): Promise<Habit | null> {
    const existing = habitDb.habits.find((h) => h.id === id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const today = getTodayString();

    const duplicated: Habit = {
      ...existing,
      id: generateId('habit'),
      name: `${existing.name} (cópia)`,
      status: 'active',
      startDate: today,
      schedule: {
        ...existing.schedule,
        effectiveFrom: today,
        startDate: today,
      },
      scheduleHistory: [],
      createdAt: now,
      updatedAt: now,
      archivedAt: undefined,
      pausedAt: undefined,
      plannedPause: undefined,
    };

    habitDb.habits.push(duplicated);
    return { ...duplicated };
  },

  async pauseHabit(
    id: string,
    options?: { plannedPause?: HabitPlannedPause },
  ): Promise<Habit | null> {
    const index = habitDb.habits.findIndex((h) => h.id === id);
    if (index === -1) return null;

    const existing = habitDb.habits[index]!;
    const now = new Date().toISOString();

    const updated: Habit = {
      ...existing,
      status: 'paused',
      pausedAt: now,
      plannedPause: options?.plannedPause,
      updatedAt: now,
    };

    habitDb.habits[index] = updated;
    return { ...updated };
  },

  async resumeHabit(id: string): Promise<Habit | null> {
    const index = habitDb.habits.findIndex((h) => h.id === id);
    if (index === -1) return null;

    const existing = habitDb.habits[index]!;
    const now = new Date().toISOString();

    const updated: Habit = {
      ...existing,
      status: 'active',
      pausedAt: undefined,
      plannedPause: undefined,
      updatedAt: now,
    };

    habitDb.habits[index] = updated;
    return { ...updated };
  },

  async archiveHabit(id: string): Promise<Habit | null> {
    const index = habitDb.habits.findIndex((h) => h.id === id);
    if (index === -1) return null;

    const existing = habitDb.habits[index]!;
    const now = new Date().toISOString();

    const updated: Habit = {
      ...existing,
      status: 'archived',
      archivedAt: now,
      updatedAt: now,
    };

    habitDb.habits[index] = updated;
    return { ...updated };
  },

  async unarchiveHabit(id: string): Promise<Habit | null> {
    const index = habitDb.habits.findIndex((h) => h.id === id);
    if (index === -1) return null;

    const existing = habitDb.habits[index]!;
    const now = new Date().toISOString();

    const updated: Habit = {
      ...existing,
      status: 'active',
      archivedAt: undefined,
      updatedAt: now,
    };

    habitDb.habits[index] = updated;
    return { ...updated };
  },

  async deleteHabit(id: string): Promise<void> {
    habitDb.habits = habitDb.habits.filter((h) => h.id !== id);
    habitDb.logs = habitDb.logs.filter((l) => l.habitId !== id);
    // Remove habit from routines
    habitDb.routines = habitDb.routines.map((r) => ({
      ...r,
      habitIds: r.habitIds.filter((hid) => hid !== id),
      items: r.items.filter((item) => item.habitId !== id),
    }));
  },

  // ----------------------------------------------------
  // LOGS
  // ----------------------------------------------------

  async getHabitLogs(habitId?: string): Promise<HabitLog[]> {
    if (habitId) {
      return habitDb.logs
        .filter((l) => l.habitId === habitId)
        .sort((a, b) => b.date.localeCompare(a.date));
    }
    return [...habitDb.logs].sort((a, b) => b.date.localeCompare(a.date));
  },

  async getHabitLog(logId: string): Promise<HabitLog | null> {
    const log = habitDb.logs.find((l) => l.id === logId);
    return log ? { ...log } : null;
  },

  async createHabitLog(
    input: Omit<HabitLog, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<HabitLog> {
    const now = new Date().toISOString();
    const log: HabitLog = {
      ...input,
      id: generateId('log'),
      createdAt: now,
      updatedAt: now,
    };

    // If updating an existing log for the same habit and date (for binary/replace), update or append
    const existingIndex = habitDb.logs.findIndex(
      (l) => l.habitId === input.habitId && l.date === input.date && l.source === 'manual',
    );

    if (existingIndex !== -1 && input.source === 'manual') {
      habitDb.logs[existingIndex] = log;
    } else {
      habitDb.logs.push(log);
    }

    return { ...log };
  },

  async updateHabitLog(id: string, patch: Partial<HabitLog>): Promise<HabitLog | null> {
    const index = habitDb.logs.findIndex((l) => l.id === id);
    if (index === -1) return null;

    const existing = habitDb.logs[index]!;
    const updated: HabitLog = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    habitDb.logs[index] = updated;
    return { ...updated };
  },

  async deleteHabitLog(id: string): Promise<void> {
    habitDb.logs = habitDb.logs.filter((l) => l.id !== id);
  },

  async skipHabitOccurrence(
    habitId: string,
    date: string,
    note?: string,
  ): Promise<HabitLog> {
    const now = new Date().toISOString();
    const log: HabitLog = {
      id: generateId('log-skip'),
      habitId,
      date,
      status: 'skipped',
      value: 0,
      source: 'manual',
      note,
      createdAt: now,
      updatedAt: now,
    };

    const existingIndex = habitDb.logs.findIndex(
      (l) => l.habitId === habitId && l.date === date,
    );

    if (existingIndex !== -1) {
      habitDb.logs[existingIndex] = log;
    } else {
      habitDb.logs.push(log);
    }

    return { ...log };
  },

  // ----------------------------------------------------
  // ROUTINES
  // ----------------------------------------------------

  async getRoutines(): Promise<HabitRoutine[]> {
    return [...habitDb.routines];
  },

  async getRoutine(id: string): Promise<HabitRoutine | null> {
    const routine = habitDb.routines.find((r) => r.id === id);
    return routine ? { ...routine } : null;
  },

  async createRoutine(
    input: Omit<HabitRoutine, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<HabitRoutine> {
    const now = new Date().toISOString();
    const routine: HabitRoutine = {
      ...input,
      id: generateId('routine'),
      active: input.active ?? true,
      createdAt: now,
      updatedAt: now,
    };

    habitDb.routines.push(routine);
    return { ...routine };
  },

  async updateRoutine(
    id: string,
    patch: Partial<HabitRoutine>,
  ): Promise<HabitRoutine | null> {
    const index = habitDb.routines.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const existing = habitDb.routines[index]!;
    const updated: HabitRoutine = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    habitDb.routines[index] = updated;
    return { ...updated };
  },

  async duplicateRoutine(id: string): Promise<HabitRoutine | null> {
    const existing = habitDb.routines.find((r) => r.id === id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const duplicated: HabitRoutine = {
      ...existing,
      id: generateId('routine'),
      name: `${existing.name} (cópia)`,
      createdAt: now,
      updatedAt: now,
    };

    habitDb.routines.push(duplicated);
    return { ...duplicated };
  },

  async archiveRoutine(id: string): Promise<HabitRoutine | null> {
    const index = habitDb.routines.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const existing = habitDb.routines[index]!;
    const now = new Date().toISOString();
    const updated: HabitRoutine = {
      ...existing,
      active: false,
      archivedAt: now,
      updatedAt: now,
    };

    habitDb.routines[index] = updated;
    return { ...updated };
  },

  async deleteRoutine(id: string): Promise<void> {
    habitDb.routines = habitDb.routines.filter((r) => r.id !== id);
  },

  // ----------------------------------------------------
  // REVIEWS
  // ----------------------------------------------------

  async getHabitReviews(): Promise<HabitReview[]> {
    return [...habitDb.reviews].sort((a, b) => b.periodEnd.localeCompare(a.periodEnd));
  },

  async createHabitReview(
    input: Omit<HabitReview, 'id' | 'createdAt'>,
  ): Promise<HabitReview> {
    const now = new Date().toISOString();
    const review: HabitReview = {
      ...input,
      id: generateId('review'),
      createdAt: now,
    };

    habitDb.reviews.push(review);
    return { ...review };
  },

  // ----------------------------------------------------
  // OCCURRENCES & ANALYTICS
  // ----------------------------------------------------

  async getHabitOccurrences(
    date: string = getTodayString(),
    weekStartsOn: 0 | 1 = 1,
  ): Promise<HabitOccurrence[]> {
    const today = getTodayString();
    return deriveHabitOccurrencesForDate(
      habitDb.habits,
      date,
      habitDb.logs,
      today,
      weekStartsOn,
    );
  },

  async getHabitOccurrenceForDate(
    habitId: string,
    date: string,
    weekStartsOn: 0 | 1 = 1,
  ): Promise<HabitOccurrence | null> {
    const habit = habitDb.habits.find((h) => h.id === habitId);
    if (!habit) return null;

    const today = getTodayString();
    return deriveHabitOccurrence(
      habit,
      date,
      habitDb.logs,
      today,
      weekStartsOn,
    );
  },

  async getHabitAnalyticsOverview(
    weekStartsOn: 0 | 1 = 1,
  ): Promise<HabitsOverviewAnalytics> {
    const today = getTodayString();
    return getHabitsOverviewAnalytics(
      habitDb.habits,
      habitDb.routines,
      habitDb.logs,
      today,
      weekStartsOn,
    );
  },
};

