import { goalDb } from '@/features/goals/services/goalMockDb';
import type { ScheduleEntry, ScheduleSourceAdapter } from '@/shared/scheduling/types';

export const goalScheduleAdapter: ScheduleSourceAdapter = {
  sourceType: 'goal',
  label: 'Metas',

  async getEntriesForDate(date: string): Promise<ScheduleEntry[]> {
    const checkIns = goalDb.checkIns.filter((ci) => ci.createdAt.startsWith(date));

    return checkIns.map((ci) => {
      const goal = goalDb.goals.find((g) => g.id === ci.goalId);
      return {
        id: `goal-${ci.id}`,
        sourceType: 'goal',
        sourceId: ci.goalId,
        title: `Revisão de Meta: ${goal?.title || 'Meta'}`,
        description: ci.whatMovedForward || ci.whatIsBlocking || undefined,
        date,
        duration: 15,
        allDay: false,
        flexible: true,
        locked: false,
        status: 'planned',
        priority: 'medium',
        context: 'personal',
        colorToken: 'schedule.source.goal',
        icon: 'TrackChangesRounded',
        syncMode: 'sourceToSchedule',
        createdAt: ci.createdAt,
        updatedAt: ci.createdAt,
      };
    });
  },

  async getUnscheduledEntries(date: string): Promise<ScheduleEntry[]> {
    return goalScheduleAdapter.getEntriesForDate(date);
  },
};

