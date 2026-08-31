import { addDays, format } from 'date-fns';
import { fromDateKey } from '@/features/leisure/utils/dateHelpers';
import { scheduleInboxService } from '@/shared/scheduling/services/scheduleInboxService';
import { generateScheduleId, scheduleDb } from '@/shared/scheduling/services/scheduleMockDb';
import type { ScheduleEntry } from '@/shared/scheduling/types';
import { dailyRhythmService } from './dailyRhythmService';

export type DayRhythmPerception = 'light' | 'balanced' | 'full' | 'unpredictable';

export interface PendingItemResolution {
  entryId: string;
  action: 'tomorrow' | 'specific_date' | 'inbox' | 'discard';
  targetDate?: string;
}

export interface DailyReviewSubmission {
  date: string;
  perception: DayRhythmPerception;
  note?: string;
  resolutions: PendingItemResolution[];
}

export interface DailyReviewData {
  date: string;
  completedItems: ScheduleEntry[];
  pendingItems: ScheduleEntry[];
  totalPlannedMinutes: number;
  totalActualMinutes: number;
}

export const dailyReviewService = {
  async getDailyReviewData(date: string): Promise<DailyReviewData> {
    const schedule = await dailyRhythmService.getDaySchedule(date);
    const all = [...schedule.entries, ...schedule.unscheduled];

    const completedItems = all.filter((e) => e.status === 'completed');
    const pendingItems = all.filter((e) => e.status === 'planned' || e.status === 'rescheduled');

    const totalPlannedMinutes = all.reduce((acc, e) => acc + e.duration, 0);
    const totalActualMinutes = completedItems.reduce((acc, e) => acc + e.duration, 0);

    return {
      date,
      completedItems,
      pendingItems,
      totalPlannedMinutes,
      totalActualMinutes,
    };
  },

  async submitDailyReview(submission: DailyReviewSubmission): Promise<void> {
    const tomorrowStr = format(addDays(fromDateKey(submission.date), 1), 'yyyy-MM-dd');
    const schedule = await dailyRhythmService.getDaySchedule(submission.date);
    const all = [...schedule.entries, ...schedule.unscheduled];

    for (const res of submission.resolutions) {
      const entry = all.find((e) => e.id === res.entryId);
      if (!entry) continue;

      if (res.action === 'tomorrow') {
        await dailyRhythmService.rescheduleEntry(entry, tomorrowStr);
      } else if (res.action === 'specific_date' && res.targetDate) {
        await dailyRhythmService.rescheduleEntry(entry, res.targetDate);
      } else if (res.action === 'inbox') {
        await scheduleInboxService.createInboxItem({
          title: entry.title,
          note: entry.description,
          source: entry.sourceType,
        });
        await dailyRhythmService.deleteScheduleEntry(entry.id);
      } else if (res.action === 'discard') {
        await dailyRhythmService.deleteScheduleEntry(entry.id);
      }
    }

    scheduleDb.activities.push({
      id: generateScheduleId('act'),
      action: 'completed',
      timestamp: new Date().toISOString(),
      details: {
        reviewDate: submission.date,
        perception: submission.perception,
        note: submission.note,
      },
    });
  },
};

