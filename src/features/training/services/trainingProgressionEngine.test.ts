import { describe, expect, it } from 'vitest';

import type { PerformedSet, RoutineExercise } from '../types';
import { suggestNextPrescription } from './trainingProgressionEngine';

describe('suggestNextPrescription', () => {
  it('dispatches to the manual strategy and returns null when progression is manual', () => {
    const routineExercise: RoutineExercise = {
      id: 're-1',
      exerciseId: 'exercise-1',
      order: 1,
      progression: { strategy: 'manual' },
      sets: [
        {
          id: 'set-1',
          order: 1,
          setType: 'working',
          targetReps: 8,
          targetLoadKg: 60,
          restSeconds: 90,
        },
      ],
    };
    expect(suggestNextPrescription(routineExercise, [])).toBeNull();
  });

  it('dispatches to the linear strategy and returns a suggestion once the success window is met', () => {
    const routineExercise: RoutineExercise = {
      id: 're-1',
      exerciseId: 'exercise-1',
      order: 1,
      progression: { strategy: 'linear', incrementKg: 2.5, incrementAfterSuccesses: 1 },
      sets: [
        {
          id: 'set-1',
          order: 1,
          setType: 'working',
          targetReps: 5,
          targetLoadKg: 100,
          restSeconds: 180,
        },
      ],
    };
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
    const result = suggestNextPrescription(routineExercise, [
      { performedSets, startedAt: '2026-01-01' },
    ]);
    expect(result).toMatchObject({ suggestedWeightKg: 102.5 });
  });
});
