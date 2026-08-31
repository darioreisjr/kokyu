import type { ReplanResult, ScheduleEntry } from '../types';
import { timeToMinutes } from '../utils/timeHelpers';
import { generateDailySchedulePlan, type DailyScheduleEngineOptions } from './dailyScheduleEngine';

export function replanRemainingDay(
  date: string,
  currentTime: string,
  entries: ScheduleEntry[],
  options: DailyScheduleEngineOptions = {},
): ReplanResult {
  const currentMin = timeToMinutes(currentTime);

  // Separate completed and past entries from remaining entries
  const preservedEntries: ScheduleEntry[] = [];
  const replanCandidates: ScheduleEntry[] = [];

  for (const entry of entries) {
    if (entry.date !== date) continue;

    const isCompleted = entry.status === 'completed';
    const entryStartMin = entry.startAt ? timeToMinutes(entry.startAt) : null;
    const isPast = entryStartMin !== null && entryStartMin < currentMin;

    if (isCompleted || (isPast && entry.locked)) {
      // Completed or past fixed items are locked in place
      preservedEntries.push(entry);
    } else if (entry.locked) {
      // Future locked events stay fixed
      preservedEntries.push(entry);
    } else {
      // Flexible past-uncompleted or future flexible items need replanning
      replanCandidates.push(entry);
    }
  }

  const effectiveStartsAt =
    options.dayStartsAt && timeToMinutes(options.dayStartsAt) > currentMin
      ? options.dayStartsAt
      : currentTime;

  const preview = generateDailySchedulePlan(
    date,
    preservedEntries,
    replanCandidates,
    {
      ...options,
      dayStartsAt: effectiveStartsAt,
    },
  );

  const unresolvedCount = preview.items.filter((i) => !i.startAt).length;

  return {
    currentTime,
    movedCount: preview.diffs.length,
    unresolvedCount,
    preview,
  };
}

