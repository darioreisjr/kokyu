import { beforeEach, describe, expect, it } from 'vitest';

import { trainingScheduleService } from './trainingScheduleService';
import { resetTrainingDb, trainingDb } from './trainingMockDb';

describe('trainingScheduleService', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  it('schedules a workout as planned', async () => {
    const entry = await trainingScheduleService.scheduleWorkout({
      date: '2026-09-01',
      routineId: 'routine-push-a',
      recurrence: 'once',
      label: 'Push A',
    });
    expect(entry.status).toBe('planned');
  });

  it('derives a missed status for a planned entry whose date has already passed', async () => {
    trainingDb.scheduleEntries.push({
      id: 'schedule-past',
      date: '2000-01-01',
      status: 'planned',
      recurrence: 'once',
      label: 'Treino antigo',
      createdAt: '2000-01-01',
      updatedAt: '2000-01-01',
    });
    const calendar = await trainingScheduleService.getTrainingCalendar();
    const entry = calendar.find((candidate) => candidate.id === 'schedule-past');
    expect(entry?.status).toBe('missed');
  });

  it('does not mark a past planned entry as missed while its program is paused', async () => {
    trainingDb.programs.push({
      id: 'program-paused',
      name: 'Programa pausado',
      durationWeeks: 4,
      blocks: [],
      status: 'paused',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    });
    trainingDb.scheduleEntries.push({
      id: 'schedule-paused-program',
      date: '2000-01-01',
      status: 'planned',
      programId: 'program-paused',
      recurrence: 'program',
      label: 'Treino de programa pausado',
      createdAt: '2000-01-01',
      updatedAt: '2000-01-01',
    });
    const calendar = await trainingScheduleService.getTrainingCalendar();
    const entry = calendar.find((candidate) => candidate.id === 'schedule-paused-program');
    expect(entry?.status).toBe('planned');
  });

  it('rescheduling moves the date and resets status back to planned', async () => {
    await trainingScheduleService.skipScheduledWorkout('schedule-pull-a-today');
    const rescheduled = await trainingScheduleService.rescheduleWorkout(
      'schedule-pull-a-today',
      '2026-09-10',
    );
    expect(rescheduled?.date).toBe('2026-09-10');
    expect(rescheduled?.status).toBe('planned');
  });

  it('skipping a scheduled workout marks it as skipped', async () => {
    const skipped = await trainingScheduleService.skipScheduledWorkout('schedule-pull-a-today');
    expect(skipped?.status).toBe('skipped');
  });

  it('filters the calendar by date range', async () => {
    const entries = await trainingScheduleService.getTrainingCalendar({
      from: '2000-01-01',
      to: '2000-01-01',
    });
    expect(entries.every((entry) => entry.date === '2000-01-01')).toBe(true);
  });

  it('generateEntriesFromProgram creates one planned entry per scheduled slot, dated relative to startDate', async () => {
    const program = {
      id: 'program-test',
      name: 'Programa de teste',
      durationWeeks: 1,
      status: 'active' as const,
      startDate: '2026-09-06', // a Sunday — weekStartsOn: 0
      blocks: [
        {
          id: 'block-1',
          name: 'Bloco 1',
          order: 1,
          type: 'base' as const,
          weeks: [
            {
              id: 'week-1',
              order: 1,
              isDeload: false,
              scheduledRoutines: [
                { weekday: 1, routineId: 'routine-push-a' }, // Monday
                { weekday: 3, routineId: 'routine-pull-a' }, // Wednesday
              ],
            },
          ],
        },
      ],
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };

    const created = await trainingScheduleService.generateEntriesFromProgram(program);
    expect(created).toHaveLength(2);
    expect(created.find((entry) => entry.routineId === 'routine-push-a')?.date).toBe('2026-09-07');
    expect(created.find((entry) => entry.routineId === 'routine-pull-a')?.date).toBe('2026-09-09');
    expect(
      created.every((entry) => entry.status === 'planned' && entry.programId === 'program-test'),
    ).toBe(true);
  });

  it('generateEntriesFromProgram returns an empty array when the program has no startDate', async () => {
    const draft = {
      id: 'p',
      name: 'x',
      durationWeeks: 1,
      status: 'draft' as const,
      blocks: [],
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };
    expect(await trainingScheduleService.generateEntriesFromProgram(draft)).toEqual([]);
  });
});
