import { addDays, addMonths, addWeeks, addYears, differenceInCalendarDays, getDay } from 'date-fns';

import type { Mission, MissionRecurrenceRule } from '../../types';
import { fromDateKey, toDateKey } from '../../utils/missionDateKey';

/** Pure — given a rule and the basis date, returns the next occurrence's date (or null for an unsupported rule). */
export function computeNextOccurrenceDate(rule: MissionRecurrenceRule, basisDateKey: string): string | null {
  const base = fromDateKey(basisDateKey);

  switch (rule.frequency) {
    case 'daily':
      return toDateKey(addDays(base, 1));
    case 'weekdays': {
      let next = addDays(base, 1);
      while (getDay(next) === 0 || getDay(next) === 6) {
        next = addDays(next, 1);
      }
      return toDateKey(next);
    }
    case 'weekly':
      return toDateKey(addWeeks(base, 1));
    case 'monthly':
      return toDateKey(addMonths(base, 1));
    case 'yearly':
      return toDateKey(addYears(base, 1));
    case 'customInterval':
      return toDateKey(addDays(base, Math.max(1, rule.intervalDays ?? 1)));
    case 'specificWeekdays': {
      const weekdays = rule.weekdays && rule.weekdays.length > 0 ? rule.weekdays : [getDay(base)];
      let next = addDays(base, 1);
      for (let i = 0; i < 14; i += 1) {
        if (weekdays.includes(getDay(next))) return toDateKey(next);
        next = addDays(next, 1);
      }
      return toDateKey(next);
    }
    default:
      return null;
  }
}

export function hasRecurrenceEnded(rule: MissionRecurrenceRule, nextDateKey: string, nextOccurrenceIndex: number): boolean {
  if (rule.endDate && nextDateKey > rule.endDate) return true;
  if (rule.occurrenceCount !== undefined && nextOccurrenceIndex > rule.occurrenceCount) return true;
  return false;
}

export type MissionRecurrenceOccurrenceInput = Omit<
  Mission,
  'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'cancelledAt' | 'archivedAt'
>;

export interface GenerateNextOccurrenceOptions {
  completedMission: Mission;
  /** "yyyy-MM-dd" the mission was actually completed on. */
  completionDate: string;
  /** 1-based index of the occurrence about to be generated within its series. */
  nextOccurrenceIndex: number;
}

/**
 * Builds the input for the next occurrence without mutating or overwriting the completed one —
 * each occurrence keeps its own row and its own history (spec "RECURRENCE INSTANCE"/"GERAR
 * PRÓXIMA"). Returns null when the rule is missing, unsupported, or the series has ended.
 */
export function generateNextOccurrence(options: GenerateNextOccurrenceOptions): MissionRecurrenceOccurrenceInput | null {
  const { completedMission, completionDate, nextOccurrenceIndex } = options;
  const rule = completedMission.recurrenceRule;
  if (!rule) return null;

  const basisDate =
    rule.basis === 'completionDate'
      ? completionDate
      : (completedMission.plannedDate ?? completedMission.deadline ?? completionDate);

  const nextDate = computeNextOccurrenceDate(rule, basisDate);
  if (!nextDate) return null;
  if (hasRecurrenceEnded(rule, nextDate, nextOccurrenceIndex)) return null;

  const deadlineOffsetDays =
    completedMission.deadline && completedMission.plannedDate
      ? differenceInCalendarDays(fromDateKey(completedMission.deadline), fromDateKey(completedMission.plannedDate))
      : null;

  return {
    title: completedMission.title,
    description: completedMission.description,
    status: 'ready',
    priority: completedMission.priority,
    importance: completedMission.importance,
    projectId: completedMission.projectId,
    sectionId: completedMission.sectionId,
    parentMissionId: completedMission.parentMissionId,
    areaId: completedMission.areaId,
    plannedDate: nextDate,
    availableFrom: undefined,
    deadline:
      deadlineOffsetDays !== null && deadlineOffsetDays >= 0
        ? toDateKey(addDays(fromDateKey(nextDate), deadlineOffsetDays))
        : undefined,
    estimatedDuration: completedMission.estimatedDuration,
    preferredDuration: completedMission.preferredDuration,
    actualDurationMinutes: undefined,
    splittable: completedMission.splittable,
    minimumChunkDuration: completedMission.minimumChunkDuration,
    energyRequirement: completedMission.energyRequirement,
    contextIds: [...completedMission.contextIds],
    tagIds: [...completedMission.tagIds],
    goalIds: [...completedMission.goalIds],
    scheduleEntryIds: [],
    recurrenceRule: rule,
    recurrenceSeriesId: completedMission.recurrenceSeriesId ?? completedMission.id,
    waitingFor: undefined,
    followUpAt: undefined,
    reminderIds: [],
    progressMode: completedMission.progressMode,
    source: 'recurrence',
    sourceEntityId: completedMission.id,
    replanCount: 0,
  };
}
