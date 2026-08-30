import { describe, expect, it } from 'vitest';

import type { PerformedSet, SetPrescription } from '../../types';
import { suggestNextDoubleProgression } from './doubleProgressionStrategy';
import type { ProgressionHistorySession } from './types';

const config = {
  strategy: 'doubleProgression' as const,
  repRangeMin: 8,
  repRangeMax: 12,
  incrementKg: 2.5,
};

const targetSets: SetPrescription[] = [
  {
    id: 'set-1',
    order: 1,
    setType: 'working',
    targetReps: 8,
    targetRepsMax: 12,
    targetLoadKg: 60,
    restSeconds: 90,
  },
  {
    id: 'set-2',
    order: 2,
    setType: 'working',
    targetReps: 8,
    targetRepsMax: 12,
    targetLoadKg: 60,
    restSeconds: 90,
  },
];

function performedAt(reps: number[]): ProgressionHistorySession {
  const performedSets: PerformedSet[] = reps.map((repCount, index) => ({
    id: `ps-${index}`,
    sessionId: 's',
    sessionExerciseId: 'se',
    setNumber: index + 1,
    setType: 'working',
    weightKg: 60,
    reps: repCount,
    completed: true,
  }));
  return { performedSets, startedAt: '2026-01-01' };
}

describe('suggestNextDoubleProgression', () => {
  it('suggests increasing the load and resetting reps once every set hits the top of the range', () => {
    const result = suggestNextDoubleProgression(config, targetSets, [performedAt([12, 12])]);
    expect(result).toMatchObject({ suggestedWeightKg: 62.5, suggestedReps: 8 });
  });

  it('does not suggest a change when even one set falls short of the top of the range', () => {
    const result = suggestNextDoubleProgression(config, targetSets, [performedAt([12, 10])]);
    expect(result).toBeNull();
  });

  it('returns null when there is no history yet', () => {
    expect(suggestNextDoubleProgression(config, targetSets, [])).toBeNull();
  });
});
