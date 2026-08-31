import type { HabitProgressSource } from './habit.types';

export type HabitLogStatus = 'completed' | 'partial' | 'missed' | 'skipped' | 'notScheduled';

export interface HabitLogContext {
  trigger?: string;      // "O que aconteceu antes?"
  whatHelped?: string;   // "O que ajudou?"
  whatHindered?: string; // "O que dificultou?"
  tags?: string[];       // ['em-casa', 'trabalho', 'viagem', etc.]
  mood?: 'great' | 'good' | 'neutral' | 'difficult';
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // "yyyy-MM-dd"
  timestamp?: string; // ISO string with exact time of completion
  status: HabitLogStatus;
  value: number;
  unit?: string;
  source: HabitProgressSource;
  /** Idempotency key from external events (e.g. "workout-sess-123") */
  sourceEventId?: string;
  note?: string;
  context?: HabitLogContext;
  createdAt: string;
  updatedAt: string;
}

