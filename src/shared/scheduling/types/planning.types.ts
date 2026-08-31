import type { DailyCapacity } from './capacity.types';
import type { ScheduleConflict } from './conflict.types';
import type {
  ScheduleContext,
  ScheduleEnergyRequirement,
  ScheduleSourceType,
} from './scheduleEntry.types';

export interface DailyPriority {
  id: string;
  sourceType: ScheduleSourceType;
  sourceId: string;
  title: string;
  order: number; // 1, 2, 3
}

export interface PendingItem {
  id: string;
  sourceType: ScheduleSourceType;
  sourceId: string;
  title: string;
  date: string;
  duration: number;
  priority?: 'low' | 'medium' | 'high' | 'focus';
}

export interface DailyPlanItem {
  entryId: string;
  sourceType: ScheduleSourceType;
  sourceId: string;
  title: string;
  date: string;
  startAt?: string;
  endAt?: string;
  duration: number;
  locked: boolean;
  priority?: 'low' | 'medium' | 'high' | 'focus';
  energyRequirement?: ScheduleEnergyRequirement;
}

export interface DailyPlan {
  id: string;
  date: string;
  priorities: DailyPriority[];
  items: DailyPlanItem[];
  appliedAt?: string;
  createdAt: string;
}

export interface PlanItemDiff {
  entryId: string;
  title: string;
  sourceType: ScheduleSourceType;
  previousStartAt?: string;
  newStartAt?: string;
  previousEndAt?: string;
  newEndAt?: string;
  reason: string;
}

export interface PlanPreview {
  date: string;
  items: DailyPlanItem[];
  diffs: PlanItemDiff[];
  capacity: DailyCapacity;
  conflicts: ScheduleConflict[];
}

export interface ReplanResult {
  preview: PlanPreview;
  movedCount: number;
  unresolvedCount: number;
  currentTime?: string;
}

export interface DayTemplateItem {
  id: string;
  title: string;
  sourceType: ScheduleSourceType;
  duration: number;
  startAt?: string;
  endAt?: string;
  locked?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'focus';
  energyRequirement?: ScheduleEnergyRequirement;
}

export interface DayTemplate {
  id: string;
  name: string;
  description?: string;
  context?: ScheduleContext;
  items: DayTemplateItem[];
  createdAt: string;
  updatedAt: string;
}

export interface BreakRule {
  id: string;
  frequencyMinutes: number; // e.g. every 90 min
  breakDurationMinutes: number; // e.g. 10 min
  enabled: boolean;
}

export interface TravelBuffer {
  fromContext: ScheduleContext;
  toContext: ScheduleContext;
  bufferMinutes: number;
}

