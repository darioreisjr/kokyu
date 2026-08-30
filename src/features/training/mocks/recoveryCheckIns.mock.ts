import { subDays } from 'date-fns';

import type { RecoveryCheckIn } from '../types';
import { toDateKey } from '../utils/dateHelpers';

export function createMockRecoveryCheckIns(referenceDate: Date = new Date()): RecoveryCheckIn[] {
  const dayAgo1 = subDays(referenceDate, 1);
  const dayAgo4 = subDays(referenceDate, 4);

  return [
    {
      id: 'recovery-checkin-1',
      date: toDateKey(dayAgo1),
      energyLevel: 4,
      disposition: 4,
      muscleSoreness: 2,
      notes: 'Pernas ainda um pouco cansadas do treino de quinta.',
      createdAt: dayAgo1.toISOString(),
    },
    {
      id: 'recovery-checkin-2',
      date: toDateKey(dayAgo4),
      energyLevel: 3,
      disposition: 3,
      muscleSoreness: 3,
      createdAt: dayAgo4.toISOString(),
    },
  ];
}
