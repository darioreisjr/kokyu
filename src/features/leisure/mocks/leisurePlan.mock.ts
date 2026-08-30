import { addDays, format } from 'date-fns';

import type { LeisurePlanEntry } from '../types/leisurePlan.types';

function dateKey(referenceDate: Date, offsetDays: number): string {
  return format(addDays(referenceDate, offsetDays), 'yyyy-MM-dd');
}

/** Offsets from `referenceDate` (real "today" in the running service, a fixed date in tests) so the demo plan always reads as "this week" whenever the app happens to be opened. */
export function createMockLeisurePlan(referenceDate: Date = new Date()): LeisurePlanEntry[] {
  const createdAt = referenceDate.toISOString();
  return [
    {
      id: 'plan-hobbit-hoje',
      leisureItemId: 'book-hobbit',
      title: 'O Hobbit',
      date: dateKey(referenceDate, 0),
      startTime: '21:00',
      duration: 30,
      completed: false,
      createdAt,
    },
    {
      id: 'plan-violao-hoje',
      leisureItemId: 'hobby-violao',
      title: 'Violão',
      date: dateKey(referenceDate, 0),
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
      date: dateKey(referenceDate, (6 - referenceDate.getDay() + 7) % 7 || 7),
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
      startTime: '20:00',
      completed: false,
      createdAt,
    },
  ];
}
