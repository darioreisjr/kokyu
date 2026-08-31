import type { HabitProgressSource, HabitUnit } from './habit.types';

export interface HabitSourceMetric {
  id: string;
  module: HabitProgressSource;
  label: string;
  unit: HabitUnit;
  description: string;
  defaultTarget?: number;
}

export interface HabitSourceEvent {
  sourceEventId: string;
  module: HabitProgressSource;
  metricId: string;
  date: string; // "yyyy-MM-dd"
  timestamp: string; // ISO string
  value: number;
  unit?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface HabitSourceAdapter {
  module: HabitProgressSource;
  label: string;
  metrics: HabitSourceMetric[];
  getAvailableEvents?: () => Promise<HabitSourceEvent[]>;
}

