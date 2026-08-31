import type { Habit } from './habit.types';
import type { HabitLog } from './log.types';

export type HabitEventType =
  | 'HabitCreated'
  | 'HabitCompleted'
  | 'HabitProgressUpdated'
  | 'HabitSkipped'
  | 'HabitPaused'
  | 'HabitResumed'
  | 'HabitArchived'
  | 'RoutineCompleted'
  | 'HabitMilestoneReached';

export interface HabitDomainEvent<T = unknown> {
  id: string;
  type: HabitEventType;
  habitId?: string;
  routineId?: string;
  payload: T;
  timestamp: string;
}

export interface HabitCompletedPayload {
  habit: Habit;
  log: HabitLog;
  streak: number;
}

export interface RoutineCompletedPayload {
  routineId: string;
  routineName: string;
  completedHabitIds: string[];
  skippedHabitIds: string[];
  totalDurationSeconds: number;
}

