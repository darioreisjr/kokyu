export type ScheduleSourceType =
  | 'mission'
  | 'habit'
  | 'training'
  | 'nutrition'
  | 'leisure'
  | 'goal'
  | 'routine'
  | 'calendar'
  | 'manual'
  | 'focus'
  | 'break'
  | 'travel'
  | 'blockedTime';

export type ScheduleEntryStatus =
  | 'planned'
  | 'inProgress'
  | 'completed'
  | 'skipped'
  | 'cancelled'
  | 'rescheduled'
  | 'missed'
  | 'unscheduled';

export type ScheduleSyncMode = 'bidirectional' | 'sourceToSchedule' | 'scheduleOnly';

export type ScheduleEnergyRequirement = 'low' | 'medium' | 'high';

export type ScheduleContext = 'work' | 'personal' | 'health' | 'leisure' | 'custom';

export type ScheduleLocationType = 'online' | 'home' | 'work' | 'gym' | 'other';

export interface ScheduleLocation {
  type: ScheduleLocationType;
  name?: string;
  address?: string;
}

export interface ScheduleRecurrence {
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  weekdays?: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  interval?: number;
  endDate?: string;
}

export interface ScheduleEntry {
  id: string;
  sourceType: ScheduleSourceType;
  sourceId: string;
  title: string;
  description?: string;
  /** Local date formatted as `yyyy-MM-dd`. */
  date: string;
  /** Start time formatted as `HH:mm`, optional for unscheduled/all-day. */
  startAt?: string;
  /** End time formatted as `HH:mm`, optional. */
  endAt?: string;
  /** Duration in minutes. */
  duration: number;
  allDay?: boolean;
  /** If flexible, the engine can reorganize this entry into available free slots. */
  flexible?: boolean;
  /** If locked, the auto-scheduler engine MUST NOT move this entry. */
  locked?: boolean;
  /** If splittable, large durations can be broken down into chunks. */
  splittable?: boolean;
  /** Minimum duration in minutes for a chunk when split (default 30 min). */
  minChunkDuration?: number;
  maxChunkDuration?: number;
  preferredTime?: string; // "HH:mm" or "morning" | "afternoon" | "evening"
  timeWindow?: {
    start: string; // "HH:mm"
    end: string;   // "HH:mm"
  };
  status: ScheduleEntryStatus;
  priority?: 'low' | 'medium' | 'high' | 'focus';
  energyRequirement?: ScheduleEnergyRequirement;
  context?: ScheduleContext;
  location?: ScheduleLocation;
  meetingUrl?: string;
  recurrence?: ScheduleRecurrence;
  recurrenceId?: string;
  originalStart?: string;
  reminderIds?: string[];
  reminders?: number[]; // minutes before (e.g. [10, 30])
  colorToken?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
  syncMode?: ScheduleSyncMode;
  plannedStart?: string;
  plannedEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export type ScheduleEntryInput = Omit<ScheduleEntry, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
};

export interface ScheduleActivity {
  id: string;
  entryId?: string;
  action:
    | 'created'
    | 'scheduled'
    | 'rescheduled'
    | 'started'
    | 'completed'
    | 'skipped'
    | 'cancelled'
    | 'plan_applied';
  timestamp: string;
  details?: Record<string, unknown>;
}

