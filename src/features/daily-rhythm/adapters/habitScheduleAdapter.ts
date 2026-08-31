import { deriveHabitOccurrencesForDate } from '@/features/habits/services/engines/habitOccurrenceService';
import { habitService } from '@/features/habits/services/habitService';
import type { ScheduleEntry, ScheduleSourceAdapter } from '@/shared/scheduling/types';
import { addMinutesToTime } from '@/shared/scheduling/utils/timeHelpers';

export const habitScheduleAdapter: ScheduleSourceAdapter = {
  sourceType: 'habit',
  label: 'Hábitos',

  async getEntriesForDate(date: string): Promise<ScheduleEntry[]> {
    const habits = await habitService.getHabits();
    const logs = await habitService.getHabitLogs();
    const today = new Date().toISOString().split('T')[0]!;

    const occurrences = deriveHabitOccurrencesForDate(habits, date, logs, today, 1);

    return occurrences
      .filter((occ) => occ.isScheduled && !occ.isPaused)
      .map((occ) => {
        const duration = occ.habit.estimatedDurationMinutes ?? 15;
        const startAt = occ.habit.preferredTime || occ.habit.timeWindow?.startTime;
        const endAt = startAt ? addMinutesToTime(startAt, duration) : undefined;

        const isCompleted = occ.status === 'completed';
        const isSkipped = occ.status === 'skipped';
        const status = isCompleted ? 'completed' : isSkipped ? 'skipped' : 'planned';

        return {
          id: `habit-${occ.habitId}-${date}`,
          sourceType: 'habit',
          sourceId: occ.habitId,
          title: occ.habit.name,
          date,
          startAt,
          endAt,
          duration,
          allDay: false,
          flexible: !occ.habit.preferredTime,
          locked: false,
          splittable: false,
          status,
          priority: occ.habit.priority ?? 'medium',
          preferredTime: occ.habit.timeOfDay,
          timeWindow: occ.habit.timeWindow
            ? { start: occ.habit.timeWindow.startTime, end: occ.habit.timeWindow.endTime }
            : undefined,
          context: occ.habit.area === 'work' ? 'work' : 'personal',
          colorToken: 'schedule.source.habit',
          icon: occ.habit.icon || 'AutorenewRounded',
          syncMode: 'bidirectional',
          createdAt: occ.habit.createdAt,
          updatedAt: occ.habit.updatedAt,
        };
      });
  },

  async getUnscheduledEntries(date: string): Promise<ScheduleEntry[]> {
    const entries = await habitScheduleAdapter.getEntriesForDate(date);
    return entries.filter((e) => !e.startAt && e.status === 'planned');
  },

  async onEntryCompleted(entry: ScheduleEntry): Promise<boolean> {
    await habitService.createHabitLog({
      habitId: entry.sourceId,
      date: entry.date,
      value: 1,
      status: 'completed',
      source: 'manual',
    });
    return true;
  },
};

