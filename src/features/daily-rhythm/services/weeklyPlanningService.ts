import { getWeekDays } from '@/features/leisure/utils/dateHelpers';
import type { DailyCapacity, ScheduleEntry } from '@/shared/scheduling/types';
import { format } from 'date-fns';
import { dailyRhythmService } from './dailyRhythmService';

export interface DayScheduleSummary {
  date: string;
  dayLabel: string;
  entries: ScheduleEntry[];
  capacity: DailyCapacity;
}

export interface WeeklyScheduleResult {
  weekStartDate: string;
  days: DayScheduleSummary[];
  totalPlannedMinutes: number;
  totalAvailableMinutes: number;
  overloadedDaysCount: number;
}

export const weeklyPlanningService = {
  async getWeeklySchedule(
    weekStartDate: Date,
    weekStartsOn: 0 | 1 = 1,
  ): Promise<WeeklyScheduleResult> {
    const days = getWeekDays(weekStartDate, weekStartsOn);
    const dayResults: DayScheduleSummary[] = [];

    let totalPlannedMinutes = 0;
    let totalAvailableMinutes = 0;
    let overloadedDaysCount = 0;

    for (const d of days) {
      const dateStr = format(d, 'yyyy-MM-dd');
      const daySchedule = await dailyRhythmService.getDaySchedule(dateStr);

      totalPlannedMinutes += daySchedule.capacity.plannedWorkloadMinutes;
      totalAvailableMinutes += daySchedule.capacity.availableMinutes;
      if (daySchedule.capacity.status === 'overcapacity') {
        overloadedDaysCount += 1;
      }

      dayResults.push({
        date: dateStr,
        dayLabel: format(d, 'EEE'),
        entries: daySchedule.entries,
        capacity: daySchedule.capacity,
      });
    }

    return {
      weekStartDate: format(days[0]!, 'yyyy-MM-dd'),
      days: dayResults,
      totalPlannedMinutes,
      totalAvailableMinutes,
      overloadedDaysCount,
    };
  },
};

