import { addDays, format } from 'date-fns';

import type { LeisureLogEntry } from '../types/leisureLog.types';

function dateKey(referenceDate: Date, offsetDays: number): string {
  return format(addDays(referenceDate, offsetDays), 'yyyy-MM-dd');
}

/** A handful of past occurrences — enough to demonstrate rewatch/multiple-sessions without padding the mock database. */
export function createMockLeisureLog(referenceDate: Date = new Date()): LeisureLogEntry[] {
  const createdAt = referenceDate.toISOString();
  return [
    {
      id: 'log-parasita',
      leisureItemId: 'movie-parasita',
      activityType: 'movie',
      title: 'Parasita',
      completedAt: `${dateKey(referenceDate, -8)}T21:30:00.000Z`,
      duration: 132,
      rating: 5,
      notes: 'Roteiro impecável, quero rever.',
      createdAt,
    },
    {
      id: 'log-cafe-cantinho',
      leisureItemId: 'place-cafe-cantinho',
      activityType: 'place',
      title: 'Café Cantinho',
      completedAt: `${dateKey(referenceDate, -27)}T16:00:00.000Z`,
      rating: 4,
      notes: 'Café coado muito bom.',
      createdAt,
    },
    {
      id: 'log-violao-1',
      leisureItemId: 'hobby-violao',
      activityType: 'hobby',
      title: 'Violão',
      completedAt: `${dateKey(referenceDate, -1)}T19:45:00.000Z`,
      duration: 40,
      notes: 'Pratiquei acordes por 40 minutos.',
      createdAt,
    },
    {
      id: 'log-violao-2',
      leisureItemId: 'hobby-violao',
      activityType: 'hobby',
      title: 'Violão',
      completedAt: `${dateKey(referenceDate, -6)}T19:30:00.000Z`,
      duration: 30,
      createdAt,
    },
  ];
}
