import type { CapacityStatus, DailyCapacity, ScheduleEntry } from '../types';
import { timeToMinutes } from '../utils/timeHelpers';

export interface DailyCapacityOptions {
  dayStartsAt?: string; // "06:00"
  dayEndsAt?: string;   // "23:00"
}

export function calculateDailyCapacity(
  date: string,
  entries: ScheduleEntry[],
  options: DailyCapacityOptions = {},
): DailyCapacity {
  const dayStartsAt = options.dayStartsAt ?? '06:00';
  const dayEndsAt = options.dayEndsAt ?? '23:00';

  const startMin = timeToMinutes(dayStartsAt);
  const endMin = timeToMinutes(dayEndsAt);
  const totalDayDurationMinutes = Math.max(0, endMin - startMin);

  const activeEntries = entries.filter(
    (e) => e.date === date && e.status !== 'cancelled' && e.status !== 'skipped',
  );

  let fixedBlockedMinutes = 0;
  let plannedWorkloadMinutes = 0;

  for (const entry of activeEntries) {
    const isFixed = entry.locked || entry.sourceType === 'blockedTime';
    if (isFixed) {
      fixedBlockedMinutes += entry.duration;
    } else {
      plannedWorkloadMinutes += entry.duration;
    }
  }

  const availableMinutes = Math.max(0, totalDayDurationMinutes - fixedBlockedMinutes);
  const utilizationPercent =
    availableMinutes > 0
      ? Math.round((plannedWorkloadMinutes / availableMinutes) * 100)
      : plannedWorkloadMinutes > 0
        ? 100
        : 0;

  let status: CapacityStatus = 'light';
  if (plannedWorkloadMinutes > availableMinutes) {
    status = 'overcapacity';
  } else if (utilizationPercent >= 86) {
    status = 'full';
  } else if (utilizationPercent >= 50) {
    status = 'balanced';
  } else {
    status = 'light';
  }

  const differenceMinutes = plannedWorkloadMinutes - availableMinutes;

  return {
    date,
    totalDayDurationMinutes,
    fixedBlockedMinutes,
    availableMinutes,
    plannedWorkloadMinutes,
    utilizationPercent,
    status,
    differenceMinutes,
  };
}

