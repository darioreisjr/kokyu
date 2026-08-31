import type { HabitTimeOfDay } from './habit.types';
import type { HabitSchedule } from './schedule.types';

export interface RoutineHabitItem {
  routineId: string;
  habitId: string;
  order: number;
  delayAfterPreviousMinutes?: number;
  customNote?: string;
}

export interface HabitRoutine {
  id: string;
  name: string;
  description?: string;
  timeOfDay: HabitTimeOfDay;
  preferredTime?: string;
  estimatedDurationMinutes?: number;
  habitIds: string[];
  items: RoutineHabitItem[];
  schedule?: HabitSchedule;
  reminder?: string;
  active: boolean;
  colorToken?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

