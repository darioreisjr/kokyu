import { leisurePlanService } from '@/features/leisure/services/leisurePlanService';
import type { ScheduleEntry, ScheduleSourceAdapter } from '@/shared/scheduling/types';
import { addMinutesToTime } from '@/shared/scheduling/utils/timeHelpers';

export const leisureScheduleAdapter: ScheduleSourceAdapter = {
  sourceType: 'leisure',
  label: 'Tempo Livre',

  async getEntriesForDate(date: string): Promise<ScheduleEntry[]> {
    const plans = await leisurePlanService.getPlanEntriesForDate(date);

    return plans.map((plan) => {
      const duration = plan.duration ?? 60;
      const startAt = plan.startTime;
      const endAt = startAt ? addMinutesToTime(startAt, duration) : undefined;

      return {
        id: `leisure-${plan.id}`,
        sourceType: 'leisure',
        sourceId: plan.id,
        title: plan.title,
        description: plan.notes,
        // `occurrenceDate`, not the series' anchor `date` — for a
        // daily/weekly plan entry viewed on a day other than its anchor,
        // `date` would report the wrong day entirely.
        date: plan.occurrenceDate,
        startAt,
        endAt,
        duration,
        allDay: false,
        flexible: true,
        locked: false,
        splittable: false,
        status: plan.completed ? 'completed' : 'planned',
        priority: 'medium',
        context: 'leisure',
        colorToken: 'schedule.source.leisure',
        icon: 'MovieRounded',
        syncMode: 'bidirectional',
        metadata: {
          leisureItemId: plan.leisureItemId,
        },
        createdAt: plan.createdAt,
        updatedAt: plan.createdAt,
      };
    });
  },

  async getUnscheduledEntries(date: string): Promise<ScheduleEntry[]> {
    const entries = await leisureScheduleAdapter.getEntriesForDate(date);
    return entries.filter((e) => !e.startAt && e.status === 'planned');
  },

  async onEntryRescheduled(
    entry: ScheduleEntry,
    newDate: string,
    newStartAt?: string,
  ): Promise<boolean> {
    const updated = await leisurePlanService.updatePlanEntry(entry.sourceId, {
      date: newDate,
      startTime: newStartAt,
    });
    return Boolean(updated);
  },

  async onEntryCompleted(entry: ScheduleEntry): Promise<boolean> {
    // `entry.date` is this occurrence's actual day (see `getEntriesForDate`
    // above) — a daily/weekly source must only complete that one day.
    const updated = await leisurePlanService.completePlanEntry(entry.sourceId, entry.date);
    return Boolean(updated);
  },

  async onEntryDeleted(entry: ScheduleEntry): Promise<boolean> {
    await leisurePlanService.deletePlanEntry(entry.sourceId);
    return true;
  },
};

