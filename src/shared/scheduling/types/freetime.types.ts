import type { ScheduleSourceType } from './scheduleEntry.types';

export interface FreeTimeSlot {
  id: string;
  /** "yyyy-MM-dd" */
  date: string;
  /** "HH:mm" */
  startAt: string;
  /** "HH:mm" */
  endAt: string;
  /** Duration in minutes */
  duration: number;
}

export interface ScheduleCandidate {
  id: string;
  sourceType: ScheduleSourceType;
  sourceId: string;
  title: string;
  subtitle?: string;
  durationMinutes: number;
  estimatedMinutes?: number;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'focus';
  icon?: string;
  splittable?: boolean;
  minChunkDuration?: number;
  metadata?: Record<string, unknown>;
}

export interface CandidateSuggestion {
  candidate: ScheduleCandidate;
  score: number;
  fitType: 'exact' | 'fits' | 'split';
  suggestedDuration: number;
  reason: string;
}

