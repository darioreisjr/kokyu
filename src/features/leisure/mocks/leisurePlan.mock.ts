import { addDays, format } from 'date-fns';

import type { LeisurePlanEntry } from '../types/leisurePlan.types';

function dateKey(referenceDate: Date, offsetDays: number): string {
  return format(addDays(referenceDate, offsetDays), 'yyyy-MM-dd');
}

/**
 * Offsets from `referenceDate` (real "today" in the running service, a
 * fixed date in tests) so the demo plan always reads as "this week"
 * whenever the app happens to be opened.
 *
 * These are raw stored rows, same shape `leisureDb.planEntries` holds
 * in the fake backend (`leisureApiFetchMock.ts`) before its
 * recurrence expansion runs — `occurrenceDate` starts equal to `date`
 * here, exactly like kokyu-sam's own repository mapping does before a
 * `'daily'`/`'weekly'` row is expanded into its actual occurrences.
 */
export function createMockLeisurePlan(referenceDate: Date = new Date()): LeisurePlanEntry[] {
  const createdAt = referenceDate.toISOString();
  const hojeKey = dateKey(referenceDate, 0);
  const sabadoKey = dateKey(referenceDate, (6 - referenceDate.getDay() + 7) % 7 || 7);
  return [
    {
      id: 'plan-hobbit-hoje',
      leisureItemId: 'book-hobbit',
      title: 'O Hobbit',
      date: hojeKey,
      occurrenceDate: hojeKey,
      startTime: '21:00',
      duration: 30,
      completed: false,
      createdAt,
    },
    {
      id: 'plan-violao-hoje',
      leisureItemId: 'hobby-violao',
      title: 'Violão',
      date: hojeKey,
      occurrenceDate: hojeKey,
      startTime: '19:00',
      duration: 45,
      recurrence: 'weekly',
      completed: false,
      createdAt,
    },
    {
      id: 'plan-filme-sabado',
      leisureItemId: 'movie-interestelar',
      title: 'Interestelar',
      date: sabadoKey,
      occurrenceDate: sabadoKey,
      startTime: '20:00',
      duration: 169,
      completed: false,
      createdAt,
    },
    {
      id: 'plan-show-futuro',
      leisureItemId: 'event-show-banda',
      title: 'Show da banda favorita',
      date: '2026-09-12',
      occurrenceDate: '2026-09-12',
      startTime: '20:00',
      completed: false,
      createdAt,
    },
  ];
}
