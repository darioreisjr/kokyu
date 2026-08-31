import type { ScheduleContext } from './scheduleEntry.types';

export interface TimeWindow {
  /** "HH:mm" (e.g. "08:00") */
  start: string;
  /** "HH:mm" (e.g. "18:00") */
  end: string;
}

export interface DayAvailability {
  /** 0 = Sunday, 1 = Monday, ..., 6 = Saturday */
  weekday: number;
  windows: TimeWindow[];
  context?: ScheduleContext;
}

export interface ContextSchedule {
  context: ScheduleContext;
  label: string;
  defaultWindows: TimeWindow[];
}

export interface AvailabilitySchedule {
  /** Fallback awake window if no explicit weekday rule applies */
  defaultDayWindow: TimeWindow;
  days: DayAvailability[];
  contexts?: ContextSchedule[];
  /** Dates marked as fully or partially unavailable (e.g. vacations, holidays) */
  blockedDates?: Array<{
    date: string; // "yyyy-MM-dd"
    allDay?: boolean;
    window?: TimeWindow;
    reason?: string;
  }>;
}

export interface ExternalCalendarEvent {
  id: string;
  provider: 'google' | 'apple' | 'outlook' | 'custom';
  calendarId: string;
  title: string;
  date: string;
  startAt?: string;
  endAt?: string;
  allDay?: boolean;
  isBusy: boolean;
  meetingUrl?: string;
}

