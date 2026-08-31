import type { FreeTimeSlot, ScheduleEntry } from '../types';
import {
  minutesToTime,
  timeToMinutes,
} from '../utils/timeHelpers';

export interface FreeTimeEngineOptions {
  dayStartsAt?: string;
  dayEndsAt?: string;
  bufferMinutes?: number;
}

export function findFreeTimeSlots(
  date: string,
  entries: ScheduleEntry[],
  options: FreeTimeEngineOptions = {},
): FreeTimeSlot[] {
  const dayStartsAt = options.dayStartsAt ?? '06:00';
  const dayEndsAt = options.dayEndsAt ?? '23:00';
  const bufferMinutes = options.bufferMinutes ?? 0;

  const dayStartMin = timeToMinutes(dayStartsAt);
  const dayEndMin = timeToMinutes(dayEndsAt);

  // 1. Filter out allDay items and entries with invalid/missing times
  const timed = entries
    .filter((e) => !e.allDay && e.startAt && e.endAt && e.status !== 'cancelled' && e.status !== 'skipped')
    .sort((a, b) => timeToMinutes(a.startAt!) - timeToMinutes(b.startAt!));

  const slots: FreeTimeSlot[] = [];
  let currentCursor = dayStartMin;

  for (const entry of timed) {
    const entryStartMin = Math.max(dayStartMin, timeToMinutes(entry.startAt!));
    const entryEndMin = Math.min(dayEndMin, timeToMinutes(entry.endAt!));

    if (entryStartMin > currentCursor) {
      const freeDuration = entryStartMin - currentCursor;
      if (freeDuration > bufferMinutes) {
        const slotStart = minutesToTime(currentCursor);
        const slotEnd = minutesToTime(entryStartMin);
        slots.push({
          id: `free-${date}-${slotStart}-${slotEnd}`,
          date,
          startAt: slotStart,
          endAt: slotEnd,
          duration: freeDuration,
        });
      }
    }

    currentCursor = Math.max(currentCursor, entryEndMin + bufferMinutes);
  }

  // 2. Check remaining time after last event until dayEndsAt
  if (currentCursor < dayEndMin) {
    const finalDuration = dayEndMin - currentCursor;
    if (finalDuration > 0) {
      const slotStart = minutesToTime(currentCursor);
      const slotEnd = minutesToTime(dayEndMin);
      slots.push({
        id: `free-${date}-${slotStart}-${slotEnd}`,
        date,
        startAt: slotStart,
        endAt: slotEnd,
        duration: finalDuration,
      });
    }
  }

  return slots;
}

