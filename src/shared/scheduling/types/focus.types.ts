import type { ScheduleSourceType } from './scheduleEntry.types';

export type FocusTimerMode = 'countdown' | 'countup';

export type FocusStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export interface FocusInterruption {
  timestamp: string;
  note?: string;
}

export interface FocusSession {
  id: string;
  scheduleEntryId?: string;
  sourceType: ScheduleSourceType;
  sourceId: string;
  title: string;
  subtitle?: string;
  /** ISO timestamp */
  startedAt: string;
  /** ISO timestamp */
  endedAt?: string;
  /** Planned duration in minutes */
  plannedDuration: number;
  /** Actual elapsed duration in seconds */
  actualDurationSeconds: number;
  mode: FocusTimerMode;
  status: FocusStatus;
  /** ISO timestamp when paused */
  pausedAt?: string;
  accumulatedPausedSeconds: number;
  interruptions?: FocusInterruption[];
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FocusSessionInput {
  scheduleEntryId?: string;
  sourceType: ScheduleSourceType;
  sourceId: string;
  title: string;
  subtitle?: string;
  plannedDuration?: number;
  mode?: FocusTimerMode;
}

