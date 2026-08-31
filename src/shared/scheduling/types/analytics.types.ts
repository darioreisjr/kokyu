import type { ScheduleSourceType } from './scheduleEntry.types';

export interface PlannedVsActual {
  date: string;
  plannedMinutes: number;
  actualMinutes: number;
  differenceMinutes: number;
  completionRatePercent: number;
}

export interface TimeBySource {
  sourceType: ScheduleSourceType;
  label: string;
  minutes: number;
  percentage: number;
  colorToken?: string;
}

export interface TimeByArea {
  area: string;
  label: string;
  minutes: number;
  percentage: number;
}

export interface FocusAnalytics {
  totalSessions: number;
  totalDurationMinutes: number;
  averageSessionMinutes: number;
  completedSessions: number;
  interruptedSessions: number;
}

export interface RescheduleRate {
  totalPlanned: number;
  rescheduledCount: number;
  ratePercent: number;
}

export interface EstimationAccuracy {
  sampleSize: number;
  averageDiscrepancyPercent: number;
  overestimatedCount: number;
  underestimatedCount: number;
}

export interface ScheduleAnalytics {
  period: 'day' | 'week' | 'month';
  plannedVsActual: PlannedVsActual[];
  timeBySource: TimeBySource[];
  timeByArea: TimeByArea[];
  focus: FocusAnalytics;
  reschedule: RescheduleRate;
  estimationAccuracy?: EstimationAccuracy;
}

