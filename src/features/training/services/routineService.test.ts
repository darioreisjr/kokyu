import { beforeEach, describe, expect, it } from 'vitest';

import type { WorkoutRoutineInput } from '../types';
import { routineService } from './routineService';
import { resetTrainingDb } from './trainingMockDb';

const minimalRoutineInput: WorkoutRoutineInput = {
  name: 'Rotina de teste',
  exercises: [
    {
      id: 're-1',
      exerciseId: 'exercise-supino-reto',
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
    },
  ],
  groups: [{ id: 'group-1', kind: 'single', routineExerciseId: 're-1' }],
};

describe('routineService', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  it('derives muscleGroups and equipmentIds from the exercises at creation time', async () => {
    const routine = await routineService.createRoutine(minimalRoutineInput);
    expect(routine.muscleGroups).toContain('chest');
    expect(routine.equipmentIds).toContain('equipment-barra');
  });

  it('re-derives muscleGroups/equipmentIds when the exercise list changes on update', async () => {
    const routine = await routineService.createRoutine(minimalRoutineInput);
    const updated = await routineService.updateRoutine(routine.id, {
      exercises: [
        {
          id: 're-2',
          exerciseId: 'exercise-agachamento-livre',
          order: 1,
          progression: { strategy: 'manual' },
          sets: [
            {
              id: 'set-2',
              order: 1,
              setType: 'working',
              targetReps: 8,
              targetLoadKg: 80,
              restSeconds: 120,
            },
          ],
        },
      ],
      groups: [{ id: 'group-2', kind: 'single', routineExerciseId: 're-2' }],
    });
    expect(updated?.muscleGroups).toContain('quads');
    expect(updated?.muscleGroups).not.toContain('chest');
  });

  it('duplicates a routine as an unfavorited, non-template copy with a new id', async () => {
    const original = await routineService.getRoutine('routine-push-a');
    const duplicate = await routineService.duplicateRoutine('routine-push-a');
    expect(duplicate?.id).not.toBe('routine-push-a');
    expect(duplicate?.name).toBe(`${original?.name} (cópia)`);
    expect(duplicate?.favorite).toBe(false);
    expect(duplicate?.exercises).toEqual(original?.exercises);
  });

  it('archives a routine instead of deleting it', async () => {
    const archived = await routineService.archiveRoutine('routine-push-a');
    expect(archived?.archived).toBe(true);
    const stillFindableWithFlag = await routineService.getRoutines({ includeArchived: true });
    expect(stillFindableWithFlag.some((routine) => routine.id === 'routine-push-a')).toBe(true);
  });

  it('excludes archived routines from the default listing', async () => {
    await routineService.archiveRoutine('routine-push-a');
    const routines = await routineService.getRoutines();
    expect(routines.some((routine) => routine.id === 'routine-push-a')).toBe(false);
  });

  it('returns null when updating a routine that does not exist', async () => {
    const result = await routineService.updateRoutine('nonexistent', { name: 'x' });
    expect(result).toBeNull();
  });
});
