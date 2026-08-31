import type {
  DailyPlanItem,
  PlanItemDiff,
  PlanPreview,
  ScheduleEntry,
} from '../types';
import { addMinutesToTime } from '../utils/timeHelpers';
import { calculateDailyCapacity } from './dailyCapacityEngine';
import { findFreeTimeSlots } from './freeTimeEngine';
import { detectScheduleConflicts } from './scheduleConflictEngine';
import { evaluateBestSlotForCandidate, rankCandidatesForScheduling } from './schedulingStrategies';

export interface DailyScheduleEngineOptions {
  dayStartsAt?: string;
  dayEndsAt?: string;
  bufferMinutes?: number;
}

export function generateDailySchedulePlan(
  date: string,
  fixedEntries: ScheduleEntry[],
  flexibleCandidates: ScheduleEntry[],
  options: DailyScheduleEngineOptions = {},
): PlanPreview {
  const dayStartsAt = options.dayStartsAt ?? '06:00';
  const dayEndsAt = options.dayEndsAt ?? '23:00';
  const bufferMinutes = options.bufferMinutes ?? 5;

  const plannedItems: DailyPlanItem[] = [];
  const diffs: PlanItemDiff[] = [];
  const scheduledEntries: ScheduleEntry[] = [];

  // 1. Add all fixed entries first (they are never moved)
  for (const entry of fixedEntries) {
    plannedItems.push({
      entryId: entry.id,
      sourceType: entry.sourceType,
      sourceId: entry.sourceId,
      title: entry.title,
      date: entry.date,
      startAt: entry.startAt,
      endAt: entry.endAt,
      duration: entry.duration,
      locked: true,
      priority: entry.priority,
      energyRequirement: entry.energyRequirement,
    });
    scheduledEntries.push(entry);
  }

  // 2. Rank flexible candidates deterministically
  const ranked = rankCandidatesForScheduling(flexibleCandidates);

  // 3. For each candidate, find current free slots and place in best slot
  for (const candidate of ranked) {
    const currentFreeSlots = findFreeTimeSlots(date, scheduledEntries, {
      dayStartsAt,
      dayEndsAt,
      bufferMinutes,
    });

    const placement = evaluateBestSlotForCandidate(candidate, currentFreeSlots);

    if (placement) {
      const startAt = placement.slot.startAt;
      const endAt = addMinutesToTime(startAt, candidate.duration);

      const scheduledCandidate: ScheduleEntry = {
        ...candidate,
        startAt,
        endAt,
      };

      scheduledEntries.push(scheduledCandidate);

      plannedItems.push({
        entryId: candidate.id,
        sourceType: candidate.sourceType,
        sourceId: candidate.sourceId,
        title: candidate.title,
        date: candidate.date,
        startAt,
        endAt,
        duration: candidate.duration,
        locked: false,
        priority: candidate.priority,
        energyRequirement: candidate.energyRequirement,
      });

      diffs.push({
        entryId: candidate.id,
        title: candidate.title,
        sourceType: candidate.sourceType,
        previousStartAt: candidate.startAt,
        newStartAt: startAt,
        previousEndAt: candidate.endAt,
        newEndAt: endAt,
        reason: placement.reason,
      });
    } else {
      // Unplaced flexible item
      plannedItems.push({
        entryId: candidate.id,
        sourceType: candidate.sourceType,
        sourceId: candidate.sourceId,
        title: candidate.title,
        date: candidate.date,
        duration: candidate.duration,
        locked: false,
        priority: candidate.priority,
        energyRequirement: candidate.energyRequirement,
      });

      diffs.push({
        entryId: candidate.id,
        title: candidate.title,
        sourceType: candidate.sourceType,
        previousStartAt: candidate.startAt,
        previousEndAt: candidate.endAt,
        reason: 'Sem janela livre contínua suficiente no dia para encaixar a duração total.',
      });
    }
  }

  // 4. Calculate final capacity and conflict analysis
  const capacity = calculateDailyCapacity(date, scheduledEntries, {
    dayStartsAt,
    dayEndsAt,
  });

  const conflicts = detectScheduleConflicts(scheduledEntries, {
    dayStartsAt,
    dayEndsAt,
  });

  return {
    date,
    items: plannedItems,
    diffs,
    capacity,
    conflicts,
  };
}

