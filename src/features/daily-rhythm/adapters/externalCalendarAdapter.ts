import type {
  ExternalCalendarEvent,
  ExternalCalendarProvider,
  ScheduleEntry,
} from '@/shared/scheduling/types';
import { calculateDurationMinutes } from '@/shared/scheduling/utils/timeHelpers';

export const mockExternalCalendarProvider: ExternalCalendarProvider = {
  providerName: 'Google Calendar Mock',

  async getEvents(startDate: string, endDate: string): Promise<ExternalCalendarEvent[]> {
    const today = new Date().toISOString().split('T')[0]!;
    if (today >= startDate && today <= endDate) {
      return [
        {
          id: 'ext-meet-1',
          provider: 'google',
          calendarId: 'work-calendar',
          title: 'Reunião de Diretoria',
          date: today,
          startAt: '15:00',
          endAt: '16:00',
          isBusy: true,
          meetingUrl: 'https://meet.google.com/abc-defg-hij',
        },
      ];
    }
    return [];
  },
};

export function convertExternalEventToScheduleEntry(event: ExternalCalendarEvent): ScheduleEntry {
  const duration =
    event.startAt && event.endAt
      ? calculateDurationMinutes(event.startAt, event.endAt)
      : 60;

  return {
    id: `ext-${event.id}`,
    sourceType: 'calendar',
    sourceId: event.id,
    title: event.title,
    date: event.date,
    startAt: event.startAt,
    endAt: event.endAt,
    duration,
    allDay: event.allDay,
    locked: true,
    flexible: false,
    splittable: false,
    status: 'planned',
    priority: 'high',
    context: 'work',
    meetingUrl: event.meetingUrl,
    colorToken: 'schedule.source.calendar',
    icon: 'EventRounded',
    syncMode: 'sourceToSchedule',
    metadata: {
      provider: event.provider,
      calendarId: event.calendarId,
      isBusy: event.isBusy,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

