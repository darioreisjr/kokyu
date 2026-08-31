import { generateDailySchedulePlan } from '@/shared/scheduling/engines/dailyScheduleEngine';
import { generateScheduleId, scheduleDb } from '@/shared/scheduling/services/scheduleMockDb';
import type {
  DailyPlan,
  DailyPlanItem,
  DailyPriority,
  PendingItem,
  PlanPreview,
  ScheduleEntry,
} from '@/shared/scheduling/types';
import { format, subDays } from 'date-fns';
import { fromDateKey } from '@/features/leisure/utils/dateHelpers';
import { dailyRhythmService } from './dailyRhythmService';

const prioritiesStore: Record<string, DailyPriority[]> = {};

export const dailyPlanningService = {
  /**
   * Step 1: "O que ficou de ontem?" — Returns incomplete items from the previous day.
   */
  async getYesterdayPendingItems(date: string): Promise<PendingItem[]> {
    const yesterday = format(subDays(fromDateKey(date), 1), 'yyyy-MM-dd');
    const yesterdaySchedule = await dailyRhythmService.getDaySchedule(yesterday);

    const pending = yesterdaySchedule.entries.concat(yesterdaySchedule.unscheduled).filter(
      (e) => e.status === 'planned' || e.status === 'rescheduled',
    );

    return pending.map((e) => ({
      id: e.id,
      sourceType: e.sourceType,
      sourceId: e.sourceId,
      title: e.title,
      date: e.date,
      duration: e.duration,
      priority: e.priority,
    }));
  },

  /**
   * Step 2: "O que já está marcado?" — Returns fixed/locked commitments for target date.
   */
  async getFixedCommitments(date: string): Promise<ScheduleEntry[]> {
    const schedule = await dailyRhythmService.getDaySchedule(date);
    return schedule.entries.filter((e) => e.locked || e.sourceType === 'blockedTime');
  },

  /**
   * Step 3: Top priorities for the day.
   */
  async getDailyPriorities(date: string): Promise<DailyPriority[]> {
    if (prioritiesStore[date]) {
      return prioritiesStore[date]!;
    }
    const schedule = await dailyRhythmService.getDaySchedule(date);
    const highPriority = schedule.entries
      .concat(schedule.unscheduled)
      .filter((e) => e.priority === 'focus' || e.priority === 'high');

    const calculated = highPriority.slice(0, 3).map((e, idx) => ({
      id: `priority-${e.id}`,
      sourceType: e.sourceType,
      sourceId: e.sourceId,
      title: e.title,
      order: idx + 1,
    }));
    prioritiesStore[date] = calculated;
    return calculated;
  },

  async setDailyPriority(
    date: string,
    priority: Omit<DailyPriority, 'id'>,
  ): Promise<DailyPriority> {
    const created: DailyPriority = {
      ...priority,
      id: generateScheduleId('prio'),
    };
    if (!prioritiesStore[date]) {
      prioritiesStore[date] = [];
    }
    prioritiesStore[date]!.push(created);
    return created;
  },

  async deleteDailyPriority(priorityId: string): Promise<void> {
    for (const [date, list] of Object.entries(prioritiesStore)) {
      prioritiesStore[date] = list.filter((p) => p.id !== priorityId);
    }
  },

  /**
   * Step 5 & 6: Generates deterministic auto-scheduling proposal with before/after diffs.
   */
  async generateAutoPlanProposal(
    date: string,
    itemsToSchedule: ScheduleEntry[],
    options: { dayStartsAt?: string; dayEndsAt?: string; bufferMinutes?: number } = {},
  ): Promise<PlanPreview> {
    const fixed = await dailyPlanningService.getFixedCommitments(date);
    return generateDailySchedulePlan(date, fixed, itemsToSchedule, options);
  },

  /**
   * Step 8: Confirms and applies the daily plan.
   */
  async applyDailyPlan(date: string, planItems: DailyPlanItem[]): Promise<DailyPlan> {
    const nowIso = new Date().toISOString();

    for (const item of planItems) {
      if (item.locked) continue;

      if (item.sourceType === 'manual') {
        const existing = scheduleDb.manualEntries.find((e) => e.id === item.entryId);
        if (existing) {
          existing.date = item.date;
          existing.startAt = item.startAt;
          existing.endAt = item.endAt;
          existing.duration = item.duration;
          existing.status = 'planned';
          existing.updatedAt = nowIso;
        } else {
          scheduleDb.manualEntries.push({
            id: item.entryId,
            sourceType: item.sourceType,
            sourceId: item.sourceId,
            title: item.title,
            date: item.date,
            startAt: item.startAt,
            endAt: item.endAt,
            duration: item.duration,
            locked: false,
            status: 'planned',
            priority: item.priority,
            createdAt: nowIso,
            updatedAt: nowIso,
          });
        }
      } else {
        // Source adapter sync
        const dummyEntry: ScheduleEntry = {
          id: item.entryId,
          sourceType: item.sourceType,
          sourceId: item.sourceId,
          title: item.title,
          date: item.date,
          startAt: item.startAt,
          endAt: item.endAt,
          duration: item.duration,
          status: 'planned',
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        await dailyRhythmService.rescheduleEntry(dummyEntry, item.date, item.startAt);
      }
    }

    const plan: DailyPlan = {
      id: generateScheduleId('plan'),
      date,
      priorities: prioritiesStore[date] || [],
      items: planItems,
      appliedAt: nowIso,
      createdAt: nowIso,
    };

    scheduleDb.activities.push({
      id: generateScheduleId('act'),
      action: 'plan_applied',
      timestamp: nowIso,
      details: { planId: plan.id, itemsCount: planItems.length },
    });

    return plan;
  },
};

