import type { ScheduleSourceType } from './scheduleEntry.types';

export type InboxConversionTarget =
  | 'mission'
  | 'habit'
  | 'training'
  | 'leisure'
  | 'schedule'
  | 'note';

export interface ScheduleInboxItem {
  id: string;
  title: string;
  note?: string;
  createdAt: string;
  source?: ScheduleSourceType | 'manual';
  processed: boolean;
  processedAt?: string;
  convertedTarget?: InboxConversionTarget;
  convertedEntityId?: string;
}

export interface ScheduleInboxItemInput {
  title: string;
  note?: string;
  source?: ScheduleSourceType | 'manual';
}

