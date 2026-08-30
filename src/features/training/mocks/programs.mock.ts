import { addWeeks, subDays } from 'date-fns';

import type { TrainingProgram } from '../types';
import { toDateKey } from '../utils/dateHelpers';

/**
 * One small example program — enough to demonstrate the Programa → Bloco → Semana architecture,
 * not a full periodized plan (per the spec's own "criar somente um exemplo pequeno"). Anchored to
 * "today" so it always shows up as a currently-active program in the demo.
 */
export function createMockPrograms(referenceDate: Date = new Date()): TrainingProgram[] {
  const startDate = subDays(referenceDate, 9);
  const durationWeeks = 6;
  const endDate = addWeeks(startDate, durationWeeks);
  const now = referenceDate.toISOString();

  return [
    {
      id: 'program-hipertrofia-fundamentos',
      name: 'Hipertrofia — Fundamentos',
      description: 'Push/Pull/Legs com foco em hipertrofia, seis semanas com deload na última.',
      goal: 'hypertrophy',
      experienceLevel: 'intermediate',
      durationWeeks,
      daysPerWeek: 3,
      status: 'active',
      startDate: toDateKey(startDate),
      endDate: toDateKey(endDate),
      blocks: [
        {
          id: 'block-acumulacao',
          name: 'Bloco 1 — Acumulação',
          order: 1,
          type: 'accumulation',
          weeks: [
            {
              id: 'week-1',
              order: 1,
              isDeload: false,
              scheduledRoutines: [
                { weekday: 1, routineId: 'routine-push-a' },
                { weekday: 3, routineId: 'routine-pull-a' },
                { weekday: 5, routineId: 'routine-legs-a' },
              ],
            },
            {
              id: 'week-2',
              order: 2,
              isDeload: false,
              scheduledRoutines: [
                { weekday: 1, routineId: 'routine-push-a' },
                { weekday: 3, routineId: 'routine-pull-a' },
                { weekday: 5, routineId: 'routine-legs-a' },
              ],
            },
            {
              id: 'week-3',
              order: 3,
              isDeload: false,
              scheduledRoutines: [
                { weekday: 1, routineId: 'routine-push-a' },
                { weekday: 3, routineId: 'routine-pull-a' },
                { weekday: 5, routineId: 'routine-legs-a' },
              ],
            },
            {
              id: 'week-4',
              order: 4,
              isDeload: false,
              scheduledRoutines: [
                { weekday: 1, routineId: 'routine-push-a' },
                { weekday: 3, routineId: 'routine-pull-a' },
                { weekday: 5, routineId: 'routine-legs-a' },
              ],
            },
            {
              id: 'week-5',
              order: 5,
              isDeload: false,
              scheduledRoutines: [
                { weekday: 1, routineId: 'routine-push-a' },
                { weekday: 3, routineId: 'routine-pull-a' },
                { weekday: 5, routineId: 'routine-legs-a' },
              ],
            },
          ],
        },
        {
          id: 'block-deload',
          name: 'Bloco 2 — Redução',
          order: 2,
          type: 'deload',
          weeks: [
            {
              id: 'week-6',
              order: 6,
              isDeload: true,
              scheduledRoutines: [
                { weekday: 1, routineId: 'routine-push-a' },
                { weekday: 3, routineId: 'routine-pull-a' },
              ],
            },
          ],
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
  ];
}
