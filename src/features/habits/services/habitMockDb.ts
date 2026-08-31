import {
  createMockHabitLogs,
  createMockHabitReviews,
  createMockHabits,
  createMockRoutines,
} from '../mocks/habits.mock';
import type { Habit } from '../types/habit.types';
import type { HabitLog } from '../types/log.types';
import type { HabitPreferences } from '../types/preferences.types';
import type { HabitReview } from '../types/review.types';
import type { HabitRoutine } from '../types/routine.types';

export const defaultHabitPreferences: HabitPreferences = {
  showStreak: true,
  showConsistencyScore: true,
  defaultTimerPresets: [5, 10, 15, 25, 30],
  soundOnComplete: true,
  celebrationAnimation: true,
};

export const habitDb: {
  habits: Habit[];
  routines: HabitRoutine[];
  logs: HabitLog[];
  reviews: HabitReview[];
  preferences: HabitPreferences;
} = {
  habits: createMockHabits(),
  routines: createMockRoutines(),
  logs: createMockHabitLogs(),
  reviews: createMockHabitReviews(),
  preferences: { ...defaultHabitPreferences },
};

let idCounter = 1;

export function generateId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

export function resetHabitDb(): void {
  habitDb.habits = createMockHabits();
  habitDb.routines = createMockRoutines();
  habitDb.logs = createMockHabitLogs();
  habitDb.reviews = createMockHabitReviews();
  habitDb.preferences = { ...defaultHabitPreferences };
}
