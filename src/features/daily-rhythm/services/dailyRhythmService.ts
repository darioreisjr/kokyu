import { calculateDailyCapacity } from '@/shared/scheduling/engines/dailyCapacityEngine';
import { findFreeTimeSlots } from '@/shared/scheduling/engines/freeTimeEngine';
import { replanRemainingDay } from '@/shared/scheduling/engines/replanEngine';
import { detectScheduleConflicts } from '@/shared/scheduling/engines/scheduleConflictEngine';
import { generateScheduleId, scheduleDb } from '@/shared/scheduling/services/scheduleMockDb';
import type {
  DailyCapacity,
  FreeTimeSlot,
  ReplanResult,
  ScheduleConflict,
  ScheduleEntry,
  ScheduleEntryInput,
  ScheduleSourceAdapter,
} from '@/shared/scheduling/types';
import { addMinutesToTime } from '@/shared/scheduling/utils/timeHelpers';
import {
  convertExternalEventToScheduleEntry,
  mockExternalCalendarProvider,
} from '../adapters/externalCalendarAdapter';
import { goalScheduleAdapter } from '../adapters/goalScheduleAdapter';
import { habitScheduleAdapter } from '../adapters/habitScheduleAdapter';
import { leisureScheduleAdapter } from '../adapters/leisureScheduleAdapter';
import { missionScheduleAdapter } from '../adapters/missionScheduleAdapter';
import { nutritionScheduleAdapter } from '../adapters/nutritionScheduleAdapter';
import { trainingScheduleAdapter } from '../adapters/trainingScheduleAdapter';

export interface DayScheduleResult {
  date: string;
  entries: ScheduleEntry[];
  unscheduled: ScheduleEntry[];
  freeSlots: FreeTimeSlot[];
  capacity: DailyCapacity;
  conflicts: ScheduleConflict[];
}

export interface DayScheduleOptions {
  dayStartsAt?: string;
  dayEndsAt?: string;
  bufferMinutes?: number;
  sourceFilter?: string[]; // array of ScheduleSourceType
}

export const sourceAdapters: Record<string, ScheduleSourceAdapter> = {
  training: trainingScheduleAdapter,
  habit: habitScheduleAdapter,
  nutrition: nutritionScheduleAdapter,
  leisure: leisureScheduleAdapter,
  mission: missionScheduleAdapter,
  goal: goalScheduleAdapter,
};

export const dailyRhythmService = {
  async getDaySchedule(
    date: string,
    options: DayScheduleOptions = {},
  ): Promise<DayScheduleResult> {
    const dayStartsAt = options.dayStartsAt ?? '06:00';
    const dayEndsAt = options.dayEndsAt ?? '23:00';

    // 1. Fetch entries from all adapters in parallel
    const adapterPromises = Object.values(sourceAdapters).map((adapter) =>
      adapter.getEntriesForDate(date),
    );
    const adapterResults = await Promise.all(adapterPromises);
    const featureEntries = adapterResults.flat();

    // 2. Fetch manual entries from scheduleDb
    const manualEntries = scheduleDb.manualEntries.filter((e) => e.date === date);

    // 3. Fetch external calendar events
    const externalEvents = await mockExternalCalendarProvider.getEvents(date, date);
    const externalEntries = externalEvents.map(convertExternalEventToScheduleEntry);

    let allEntries = [...featureEntries, ...manualEntries, ...externalEntries];

    // Filter by source if requested
    if (options.sourceFilter && options.sourceFilter.length > 0) {
      allEntries = allEntries.filter((e) => options.sourceFilter!.includes(e.sourceType));
    }

    // Sort timed entries chronologically
    const timedEntries = allEntries
      .filter((e) => Boolean(e.startAt))
      .sort((a, b) => a.startAt!.localeCompare(b.startAt!));

    const unscheduled = allEntries.filter((e) => !e.startAt && e.status === 'planned');

    // 4. Calculate free time slots
    const freeSlots = findFreeTimeSlots(date, timedEntries, {
      dayStartsAt,
      dayEndsAt,
    });

    // 5. Calculate daily capacity
    const capacity = calculateDailyCapacity(date, allEntries, {
      dayStartsAt,
      dayEndsAt,
    });

    // 6. Detect schedule conflicts
    const conflicts = detectScheduleConflicts(timedEntries, {
      dayStartsAt,
      dayEndsAt,
    });

    return {
      date,
      entries: timedEntries,
      unscheduled,
      freeSlots,
      capacity,
      conflicts,
    };
  },

  async createScheduleEntry(input: ScheduleEntryInput): Promise<ScheduleEntry> {
    const nowIso = new Date().toISOString();
    const duration = input.duration ?? 60;
    const endAt = input.startAt ? addMinutesToTime(input.startAt, duration) : undefined;

    const entry: ScheduleEntry = {
      ...input,
      id: input.id || generateScheduleId('manual'),
      sourceType: input.sourceType || 'manual',
      sourceId: input.sourceId || generateScheduleId('src'),
      duration,
      endAt,
      status: input.status || 'planned',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    scheduleDb.manualEntries.push(entry);
    return entry;
  },

  async updateScheduleEntry(
    id: string,
    patch: Partial<ScheduleEntryInput>,
  ): Promise<ScheduleEntry | null> {
    const index = scheduleDb.manualEntries.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const existing = scheduleDb.manualEntries[index]!;
    const duration = patch.duration ?? existing.duration;
    const startAt = patch.startAt !== undefined ? patch.startAt : existing.startAt;
    const endAt = startAt ? addMinutesToTime(startAt, duration) : undefined;

    const updated: ScheduleEntry = {
      ...existing,
      ...patch,
      duration,
      startAt,
      endAt,
      updatedAt: new Date().toISOString(),
    };

    scheduleDb.manualEntries[index] = updated;
    return updated;
  },

  async deleteScheduleEntry(id: string): Promise<boolean> {
    const manualIndex = scheduleDb.manualEntries.findIndex((e) => e.id === id);
    if (manualIndex !== -1) {
      scheduleDb.manualEntries.splice(manualIndex, 1);
      return true;
    }

    // Try finding in adapters
    for (const adapter of Object.values(sourceAdapters)) {
      if (adapter.onEntryDeleted) {
        // ID pattern: `${sourceType}-${sourceId}`
        const prefix = `${adapter.sourceType}-`;
        if (id.startsWith(prefix)) {
          const sourceId = id.replace(prefix, '');
          const dummyEntry: ScheduleEntry = {
            id,
            sourceType: adapter.sourceType,
            sourceId,
            title: '',
            date: '',
            duration: 0,
            status: 'planned',
            createdAt: '',
            updatedAt: '',
          };
          await adapter.onEntryDeleted(dummyEntry);
          return true;
        }
      }
    }
    return false;
  },

  async rescheduleEntry(
    entry: ScheduleEntry,
    newDate: string,
    newStartAt?: string,
  ): Promise<boolean> {
    if (entry.sourceType === 'manual') {
      const updated = await dailyRhythmService.updateScheduleEntry(entry.id, {
        date: newDate,
        startAt: newStartAt,
      });
      return Boolean(updated);
    }

    const adapter = sourceAdapters[entry.sourceType];
    if (adapter?.onEntryRescheduled) {
      return adapter.onEntryRescheduled(entry, newDate, newStartAt);
    }

    return false;
  },

  async completeEntry(entry: ScheduleEntry): Promise<boolean> {
    if (entry.sourceType === 'manual') {
      const updated = await dailyRhythmService.updateScheduleEntry(entry.id, {
        status: 'completed',
        actualStart: entry.startAt,
        actualEnd: entry.endAt,
      });
      return Boolean(updated);
    }

    const adapter = sourceAdapters[entry.sourceType];
    if (adapter?.onEntryCompleted) {
      return adapter.onEntryCompleted(entry);
    }

    return false;
  },

  async replanDay(
    date: string,
    currentTime: string,
    options: DayScheduleOptions = {},
  ): Promise<ReplanResult> {
    const daySchedule = await dailyRhythmService.getDaySchedule(date, options);
    const all = [...daySchedule.entries, ...daySchedule.unscheduled];
    return replanRemainingDay(date, currentTime, all, {
      dayStartsAt: options.dayStartsAt,
      dayEndsAt: options.dayEndsAt,
      bufferMinutes: options.bufferMinutes,
    });
  },
};

