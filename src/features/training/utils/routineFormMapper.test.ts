import { describe, expect, it } from 'vitest';

import type { RoutineFormValues } from '../schemas/routineSchema';
import type { WorkoutRoutine } from '../types';
import { mapFormValuesToRoutineInput, mapRoutineToFormValues } from './routineFormMapper';

describe('mapFormValuesToRoutineInput', () => {
  const baseFormValues: RoutineFormValues = {
    name: 'Push A',
    description: '',
    exercises: [
      {
        id: 're-1',
        exerciseId: 'exercise-supino-reto',
        order: 1,
        progressionStrategy: 'manual',
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
      },
    ],
  };

  it('maps a manual-progression exercise straight through', () => {
    const input = mapFormValuesToRoutineInput(baseFormValues);
    expect(input.exercises[0]!.progression).toEqual({ strategy: 'manual' });
    expect(input.groups).toEqual([{ id: 'group-re-1', kind: 'single', routineExerciseId: 're-1' }]);
  });

  it('maps flattened linear-progression fields into a LinearProgressionConfig', () => {
    const input = mapFormValuesToRoutineInput({
      ...baseFormValues,
      exercises: [
        {
          ...baseFormValues.exercises[0]!,
          progressionStrategy: 'linear',
          incrementKg: 2.5,
          incrementAfterSuccesses: 2,
        },
      ],
    });
    expect(input.exercises[0]!.progression).toEqual({
      strategy: 'linear',
      incrementKg: 2.5,
      incrementAfterSuccesses: 2,
    });
  });

  it('groups two exercises sharing a groupId into a superset', () => {
    const input = mapFormValuesToRoutineInput({
      ...baseFormValues,
      exercises: [
        { ...baseFormValues.exercises[0]!, groupId: 'group-a' },
        {
          id: 're-2',
          exerciseId: 'exercise-elevacao-lateral',
          order: 2,
          groupId: 'group-a',
          progressionStrategy: 'manual',
          sets: [{ id: 'set-2', order: 1, setType: 'working', targetReps: 12, restSeconds: 15 }],
        },
      ],
    });
    expect(input.groups).toEqual([
      {
        id: 'group-a',
        kind: 'superset',
        routineExerciseIds: ['re-1', 're-2'],
        restBetweenExercisesSeconds: 15,
      },
    ]);
  });

  it('round-trips a routine through mapRoutineToFormValues → mapFormValuesToRoutineInput without losing the progression config', () => {
    const routine: WorkoutRoutine = {
      id: 'routine-1',
      name: 'Legs A',
      exercises: [
        {
          id: 're-1',
          exerciseId: 'exercise-agachamento-livre',
          order: 1,
          progression: {
            strategy: 'doubleProgression',
            repRangeMin: 6,
            repRangeMax: 8,
            incrementKg: 5,
          },
          sets: [
            {
              id: 'set-1',
              order: 1,
              setType: 'working',
              targetReps: 6,
              targetRepsMax: 8,
              targetLoadKg: 90,
              restSeconds: 150,
            },
          ],
        },
      ],
      groups: [{ id: 'group-re-1', kind: 'single', routineExerciseId: 're-1' }],
      muscleGroups: ['quads'],
      equipmentIds: [],
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };
    const formValues = mapRoutineToFormValues(routine);
    const input = mapFormValuesToRoutineInput(formValues);
    expect(input.exercises[0]!.progression).toEqual(routine.exercises[0]!.progression);
  });
});
