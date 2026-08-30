import type { RoutineGoal } from './routine.types';

export type ProgramStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type TrainingBlockType =
  'base' | 'accumulation' | 'intensification' | 'peak' | 'deload' | 'custom';

export interface ScheduledRoutineSlot {
  /** 0 = Sunday .. 6 = Saturday (`Date#getDay()`), same numbering `features/settings`'s `weekStartsOn` already uses. */
  weekday: number;
  routineId: string;
}

export interface ProgramWeek {
  id: string;
  order: number;
  /** Marks the week as a planned reduction — never generated automatically, only user-labeled. */
  isDeload: boolean;
  scheduledRoutines: ScheduledRoutineSlot[];
}

export interface TrainingBlock {
  id: string;
  name: string;
  order: number;
  type: TrainingBlockType;
  weeks: ProgramWeek[];
}

export interface TrainingProgram {
  id: string;
  name: string;
  description?: string;
  goal?: RoutineGoal;
  experienceLevel?: ExperienceLevel;
  durationWeeks: number;
  daysPerWeek?: number;
  blocks: TrainingBlock[];
  status: ProgramStatus;
  startDate?: string;
  /** Derived from `startDate + durationWeeks` once the program is active/completed; absent otherwise. */
  endDate?: string;
  pausedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type TrainingProgramInput = Omit<
  TrainingProgram,
  'id' | 'status' | 'startDate' | 'endDate' | 'pausedAt' | 'createdAt' | 'updatedAt'
>;
