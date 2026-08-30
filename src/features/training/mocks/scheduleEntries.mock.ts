import { addDays, subDays } from 'date-fns';

import type { TrainingScheduleEntry } from '../types';
import { toDateKey } from '../utils/dateHelpers';

/**
 * Anchored to "today" (`referenceDate`) so the Hoje/Calendário demo always feels current: four
 * past entries mirror the completed sessions in `sessions.mock.ts`, today is a planned workout,
 * and a couple of rest days and one "próximo treino" round out the week.
 */
export function createMockScheduleEntries(
  referenceDate: Date = new Date(),
): TrainingScheduleEntry[] {
  const now = referenceDate.toISOString();

  return [
    {
      id: 'schedule-push-a-1',
      date: toDateKey(subDays(referenceDate, 9)),
      status: 'completed',
      routineId: 'routine-push-a',
      sessionId: 'session-push-a-1',
      recurrence: 'weekly',
      label: 'Push A',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'schedule-pull-a-1',
      date: toDateKey(subDays(referenceDate, 6)),
      status: 'completed',
      routineId: 'routine-pull-a',
      sessionId: 'session-pull-a-1',
      recurrence: 'weekly',
      label: 'Pull A',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'schedule-rest-1',
      date: toDateKey(subDays(referenceDate, 5)),
      status: 'rest',
      recurrence: 'once',
      label: 'Descanso',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'schedule-legs-a-1',
      date: toDateKey(subDays(referenceDate, 4)),
      status: 'completed',
      routineId: 'routine-legs-a',
      sessionId: 'session-legs-a-1',
      recurrence: 'weekly',
      label: 'Legs A',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'schedule-push-a-2',
      date: toDateKey(subDays(referenceDate, 2)),
      status: 'completed',
      routineId: 'routine-push-a',
      sessionId: 'session-push-a-2',
      recurrence: 'weekly',
      label: 'Push A',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'schedule-rest-2',
      date: toDateKey(subDays(referenceDate, 1)),
      status: 'rest',
      recurrence: 'once',
      label: 'Descanso',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'schedule-pull-a-today',
      date: toDateKey(referenceDate),
      time: '19:00',
      status: 'planned',
      routineId: 'routine-pull-a',
      estimatedDurationMinutes: 65,
      recurrence: 'weekly',
      reminder: true,
      label: 'Pull A',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'schedule-rest-3',
      date: toDateKey(addDays(referenceDate, 1)),
      status: 'rest',
      recurrence: 'once',
      label: 'Descanso',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'schedule-legs-a-next',
      date: toDateKey(addDays(referenceDate, 2)),
      time: '19:00',
      status: 'planned',
      routineId: 'routine-legs-a',
      estimatedDurationMinutes: 70,
      recurrence: 'weekly',
      reminder: true,
      label: 'Legs A',
      createdAt: now,
      updatedAt: now,
    },
  ];
}
