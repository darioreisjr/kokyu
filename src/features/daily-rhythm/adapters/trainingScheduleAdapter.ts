import { trainingScheduleService } from '@/features/training/services/trainingScheduleService';
import type { ScheduleEntry, ScheduleSourceAdapter } from '@/shared/scheduling/types';
import { addMinutesToTime } from '@/shared/scheduling/utils/timeHelpers';

export const trainingScheduleAdapter: ScheduleSourceAdapter = {
  sourceType: 'training',
  label: 'Treinamento',

  async getEntriesForDate(date: string): Promise<ScheduleEntry[]> {
    const plans = await trainingScheduleService.getEntriesForDate(date);

    return plans.map((plan) => {
      const duration = plan.estimatedDurationMinutes ?? 60;
      const startAt = plan.time;
      const endAt = startAt ? addMinutesToTime(startAt, duration) : undefined;

      return {
        id: `training-${plan.id}`,
        sourceType: 'training',
        sourceId: plan.id,
        title: plan.label || 'Sessão de Treino',
        date: plan.date,
        startAt,
        endAt,
        duration,
        allDay: false,
        flexible: !startAt,
        locked: Boolean(startAt),
        splittable: false,
        status: plan.status === 'completed' ? 'completed' : 'planned',
        priority: 'high',
        energyRequirement: 'high',
        context: 'health',
        colorToken: 'schedule.source.training',
        icon: 'FitnessCenterRounded',
        syncMode: 'bidirectional',
        metadata: {
          routineId: plan.routineId,
        },
        createdAt: plan.createdAt,
        updatedAt: plan.createdAt,
      };
    });
  },

  async getUnscheduledEntries(date: string): Promise<ScheduleEntry[]> {
    const entries = await trainingScheduleAdapter.getEntriesForDate(date);
    return entries.filter((e) => !e.startAt && e.status === 'planned');
  },

  async onEntryRescheduled(
    entry: ScheduleEntry,
    newDate: string,
    newStartAt?: string,
  ): Promise<boolean> {
    const updated = await trainingScheduleService.rescheduleWorkout(entry.sourceId, newDate);
    if (updated && newStartAt) {
      updated.time = newStartAt;
    }
    return Boolean(updated);
  },

  async onEntryCompleted(entry: ScheduleEntry): Promise<boolean> {
    const entries = await trainingScheduleService.getEntriesForDate(entry.date);
    const target = entries.find((e) => e.id === entry.sourceId);
    if (target) {
      target.status = 'completed';
      return true;
    }
    return false;
  },

  async onEntryDeleted(entry: ScheduleEntry): Promise<boolean> {
    await trainingScheduleService.cancelEntry(entry.sourceId);
    return true;
  },
};

