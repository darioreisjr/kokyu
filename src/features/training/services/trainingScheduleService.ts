import { addDays, startOfWeek } from 'date-fns';

import type { TrainingProgram, TrainingScheduleEntry, TrainingScheduleEntryInput } from '../types';
import { fromDateKey, toDateKey } from '../utils/dateHelpers';
import { generateId, trainingDb } from './trainingMockDb';

export interface DateRange {
  from: string;
  to: string;
}

/** A `planned` entry whose date has passed becomes `missed` — write-through on read, same pattern as `goalService`'s `hydrateGoalStatus`. Skipped while the owning program is paused (per the spec's own "enquanto pausado: não gerar status de treino perdido"). */
function hydrateMissedEntries(): void {
  const today = toDateKey(new Date());
  trainingDb.scheduleEntries = trainingDb.scheduleEntries.map((entry) => {
    if (entry.status !== 'planned' || entry.date >= today) return entry;
    if (entry.programId) {
      const program = trainingDb.programs.find((candidate) => candidate.id === entry.programId);
      if (program?.status === 'paused') return entry;
    }
    return { ...entry, status: 'missed', updatedAt: new Date().toISOString() };
  });
}

export const trainingScheduleService = {
  async getTrainingCalendar(range?: DateRange): Promise<TrainingScheduleEntry[]> {
    hydrateMissedEntries();
    return trainingDb.scheduleEntries.filter((entry) => {
      if (!range) return true;
      return entry.date >= range.from && entry.date <= range.to;
    });
  },

  async getEntriesForDate(date: string): Promise<TrainingScheduleEntry[]> {
    hydrateMissedEntries();
    return trainingDb.scheduleEntries.filter((entry) => entry.date === date);
  },

  async scheduleWorkout(input: TrainingScheduleEntryInput): Promise<TrainingScheduleEntry> {
    const now = new Date().toISOString();
    const entry: TrainingScheduleEntry = {
      ...input,
      id: generateId('schedule'),
      status: 'planned',
      createdAt: now,
      updatedAt: now,
    };
    trainingDb.scheduleEntries.push(entry);
    return entry;
  },

  async rescheduleWorkout(entryId: string, newDate: string): Promise<TrainingScheduleEntry | null> {
    const index = trainingDb.scheduleEntries.findIndex((entry) => entry.id === entryId);
    if (index === -1) return null;
    const updated: TrainingScheduleEntry = {
      ...trainingDb.scheduleEntries[index]!,
      date: newDate,
      status: 'planned',
      updatedAt: new Date().toISOString(),
    };
    trainingDb.scheduleEntries[index] = updated;
    return updated;
  },

  async skipScheduledWorkout(entryId: string): Promise<TrainingScheduleEntry | null> {
    const index = trainingDb.scheduleEntries.findIndex((entry) => entry.id === entryId);
    if (index === -1) return null;
    const updated: TrainingScheduleEntry = {
      ...trainingDb.scheduleEntries[index]!,
      status: 'skipped',
      updatedAt: new Date().toISOString(),
    };
    trainingDb.scheduleEntries[index] = updated;
    return updated;
  },

  async cancelEntry(entryId: string): Promise<void> {
    trainingDb.scheduleEntries = trainingDb.scheduleEntries.filter((entry) => entry.id !== entryId);
  },

  /**
   * Turns a started program's blocks/weeks into real calendar entries — `program.startDate` is
   * treated as falling in the Sunday-anchored week 1 (weekday numbering matches
   * `ScheduledRoutineSlot.weekday`, 0 = Sunday). Rest days never get an explicit entry (per the
   * spec's own "não precisa criar sessão vazia" for program rest days).
   */
  async generateEntriesFromProgram(program: TrainingProgram): Promise<TrainingScheduleEntry[]> {
    if (!program.startDate) return [];
    const weekStart = startOfWeek(fromDateKey(program.startDate), { weekStartsOn: 0 });
    const created: TrainingScheduleEntry[] = [];
    let overallWeekIndex = 0;

    for (const block of program.blocks) {
      for (const week of block.weeks) {
        for (const slot of week.scheduledRoutines) {
          const routine = trainingDb.routines.find((candidate) => candidate.id === slot.routineId);
          const entry = await trainingScheduleService.scheduleWorkout({
            date: toDateKey(addDays(weekStart, overallWeekIndex * 7 + slot.weekday)),
            routineId: slot.routineId,
            programId: program.id,
            programWeekId: week.id,
            recurrence: 'program',
            label: routine?.name ?? 'Treino',
          });
          created.push(entry);
        }
        overallWeekIndex += 1;
      }
    }

    return created;
  },
};
