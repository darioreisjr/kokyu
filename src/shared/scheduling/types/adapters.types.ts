import type { ExternalCalendarEvent } from './availability.types';
import type { ScheduleCandidate } from './freetime.types';
import type { ScheduleEntry, ScheduleSourceType } from './scheduleEntry.types';

export interface ScheduleAction {
  id: string;
  label: string;
  icon?: string;
  variant?: 'default' | 'primary' | 'danger';
  href?: string;
  perform: (entry: ScheduleEntry) => Promise<void> | void;
}

export interface ScheduleSourceAdapter {
  sourceType: ScheduleSourceType;
  label: string;
  getEntriesForDate: (date: string) => Promise<ScheduleEntry[]>;
  getUnscheduledEntries?: (date: string) => Promise<ScheduleEntry[]>;
  onEntryRescheduled?: (
    entry: ScheduleEntry,
    newDate: string,
    newStartAt?: string,
  ) => Promise<boolean>;
  onEntryCompleted?: (entry: ScheduleEntry) => Promise<boolean>;
  onEntryDeleted?: (entry: ScheduleEntry) => Promise<boolean>;
}

export interface ScheduleCandidateProvider {
  sourceType: ScheduleSourceType;
  label: string;
  getCandidatesForSlot: (availableMinutes: number, date?: string) => Promise<ScheduleCandidate[]>;
}

export interface ScheduleEntryActionProvider {
  getActionsForEntry: (entry: ScheduleEntry) => ScheduleAction[];
}

export interface ExternalCalendarProvider {
  providerName: string;
  getEvents: (startDate: string, endDate: string) => Promise<ExternalCalendarEvent[]>;
}

