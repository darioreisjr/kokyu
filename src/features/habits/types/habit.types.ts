import type { HabitSchedule, HabitScheduleVersion } from './schedule.types';

/** The area of life a habit belongs to — compatible with Kokyu modules and goals. */
export type HabitArea =
  | 'routine'
  | 'work'
  | 'training'
  | 'nutrition'
  | 'habits'
  | 'leisure'
  | 'personal'
  | 'other';

/**
 * Direction defines the intent of the habit:
 * - 'build': behaviors we want to cultivate/repeat
 * - 'reduce': behaviors we want to reduce or limit
 * - 'observe': behaviors we just want to track without labeling good/bad
 */
export type HabitDirection = 'build' | 'reduce' | 'observe';

/**
 * The method of tracking:
 * - 'binary': Done / Not done (e.g. Make the bed)
 * - 'count': Times per period / tally (e.g. 4 glasses)
 * - 'quantity': Numeric target with unit (e.g. 20 pages)
 * - 'duration': Time-based with timer/logging (e.g. 30 minutes)
 * - 'limit': Maximum threshold (e.g. Max 2 sodas / week)
 * - 'automatic': Fed automatically by another Kokyu module
 */
export type HabitTrackingType =
  | 'binary'
  | 'count'
  | 'quantity'
  | 'duration'
  | 'limit'
  | 'automatic';

export type HabitStatus = 'active' | 'paused' | 'completed' | 'archived';

export type HabitPriority = 'low' | 'medium' | 'high' | 'focus';

export type HabitUnit =
  | 'times'
  | 'pages'
  | 'minutes'
  | 'hours'
  | 'cups'
  | 'km'
  | 'units'
  | 'words'
  | 'lessons'
  | 'custom';

export type HabitTimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime' | 'specific';

export interface HabitTimeWindow {
  startTime: string; // "07:00"
  endTime: string;   // "09:00"
}

export type HabitProgressSource =
  | 'manual'
  | 'training'
  | 'nutrition'
  | 'leisure'
  | 'missions'
  | 'schedule'
  | 'external';

export interface HabitSourceRef {
  module: HabitProgressSource;
  metricId: string;
  eventType?: string;
  autoLog?: boolean;
}

export interface HabitReminder {
  id: string;
  time: string; // "HH:mm"
  days?: number[]; // [1, 2, 3, 4, 5]
  enabled: boolean;
  smartOnlyIfNotCompleted?: boolean;
}

export interface HabitPlannedPause {
  startDate: string; // "yyyy-MM-dd"
  endDate?: string;  // "yyyy-MM-dd"
  reason?: string;
}

export interface HabitBinaryTarget {
  type: 'binary';
}

export interface HabitCountTarget {
  type: 'count';
  targetValue: number;
}

export interface HabitQuantityTarget {
  type: 'quantity';
  targetValue: number;
  unit: HabitUnit;
  customUnitLabel?: string;
  allowOverachievement?: boolean;
}

export interface HabitDurationTarget {
  type: 'duration';
  targetMinutes: number;
  minimumMinutes?: number;
  timerPresets?: number[]; // [5, 10, 15, 25, 30]
}

export interface HabitLimitTarget {
  type: 'limit';
  maxLimit: number;
  unit?: HabitUnit;
  customUnitLabel?: string;
  period: 'day' | 'week' | 'month';
}

export interface HabitAutomaticTarget {
  type: 'automatic';
  metricId: string;
  targetValue?: number;
  unit?: HabitUnit;
  customUnitLabel?: string;
}

export type HabitTarget =
  | HabitBinaryTarget
  | HabitCountTarget
  | HabitQuantityTarget
  | HabitDurationTarget
  | HabitLimitTarget
  | HabitAutomaticTarget;

export interface Habit {
  id: string;
  name: string;
  description?: string;
  area: HabitArea;
  direction: HabitDirection;
  trackingType: HabitTrackingType;
  status: HabitStatus;
  target: HabitTarget;
  schedule: HabitSchedule;
  scheduleHistory?: HabitScheduleVersion[];
  reminders: HabitReminder[];
  timeOfDay: HabitTimeOfDay;
  preferredTime?: string; // "07:30"
  timeWindow?: HabitTimeWindow;
  estimatedDurationMinutes?: number;
  minimumDurationMinutes?: number;
  startDate: string; // "yyyy-MM-dd"
  endDate?: string;  // "yyyy-MM-dd"
  priority?: HabitPriority;
  colorToken?: string;
  icon: string; // e.g. "AutoStoriesRounded", "FitnessCenterRounded"
  tags: string[];
  motivation?: string;
  cue?: string; // "Depois de..."
  triggerHabitId?: string; // habit stacking cue
  reward?: string;
  source: HabitProgressSource;
  sourceRef?: HabitSourceRef;
  goalIds: string[];
  routineIds: string[];
  plannedPause?: HabitPlannedPause;
  order?: number;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  pausedAt?: string;
}

