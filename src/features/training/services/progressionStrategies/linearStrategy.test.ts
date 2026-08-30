import { describe, expect, it } from 'vitest';

import type { PerformedSet, SetPrescription } from '../../types';
import { suggestNextLinear } from './linearStrategy';
import type { ProgressionHistorySession } from './types';

const targetSets: SetPrescription[] = [
  { id: 'set-1', order: 1, setType: 'working', targetReps: 5, targetLoadKg: 100, restSeconds: 180 },
];

function successfulSession(startedAt: string): ProgressionHistorySession {
  const performedSets: PerformedSet[] = [
    {
      id: 'ps-1',
      sessionId: 's',
      sessionExerciseId: 'se',
      setNumber: 1,
      setType: 'working',
      weightKg: 100,
      reps: 5,
      completed: true,
    },
  ];
  return { performedSets, startedAt };
}

describe('suggestNextLinear', () => {
  it('returns null for a non-linear config', () => {
    expect(suggestNextLinear({ strategy: 'manual' }, targetSets, [])).toBeNull();
  });

  it('returns null when there is not yet enough history', () => {
    const config = { strategy: 'linear' as const, incrementKg: 2.5, incrementAfterSuccesses: 2 };
    expect(suggestNextLinear(config, targetSets, [successfulSession('2026-01-01')])).toBeNull();
  });

  it('suggests an increment once the required number of sessions all hit the target', () => {
    const config = { strategy: 'linear' as const, incrementKg: 2.5, incrementAfterSuccesses: 2 };
    const history = [successfulSession('2026-01-03'), successfulSession('2026-01-01')];
    const result = suggestNextLinear(config, targetSets, history);
    expect(result).toMatchObject({ suggestedWeightKg: 102.5 });
  });

  it('does not suggest an increment when a set in the window missed its target', () => {
    const config = { strategy: 'linear' as const, incrementKg: 2.5, incrementAfterSuccesses: 2 };
    const missedSession: ProgressionHistorySession = {
      startedAt: '2026-01-01',
      performedSets: [
        {
          id: 'ps-1',
          sessionId: 's',
          sessionExerciseId: 'se',
          setNumber: 1,
          setType: 'working',
          weightKg: 100,
          reps: 3,
          completed: true,
        },
      ],
    };
    const result = suggestNextLinear(config, targetSets, [
      successfulSession('2026-01-03'),
      missedSession,
    ]);
    expect(result).toBeNull();
  });
});
