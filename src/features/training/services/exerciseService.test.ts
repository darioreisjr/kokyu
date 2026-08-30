import { beforeEach, describe, expect, it } from 'vitest';

import { exerciseService } from './exerciseService';
import { resetTrainingDb } from './trainingMockDb';

describe('exerciseService', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  it('creates a custom exercise with a generated slug and defaults', async () => {
    const exercise = await exerciseService.createCustomExercise({
      name: 'Remada unilateral com elástico',
      exerciseType: 'strength',
      primaryMuscles: ['back'],
      secondaryMuscles: [],
      equipmentIds: [],
      trackingType: 'weightReps',
    });
    expect(exercise.createdByUser).toBe(true);
    expect(exercise.slug).toBe('remada-unilateral-com-elastico');
    expect(exercise.favorite).toBe(false);
    expect(exercise.archived).toBe(false);
  });

  it('does not allow editing a library (non-custom) exercise', async () => {
    const result = await exerciseService.updateExercise('exercise-supino-reto', {
      name: 'Outro nome',
    });
    expect(result).toBeNull();
    const stillOriginal = await exerciseService.getExercise('exercise-supino-reto');
    expect(stillOriginal?.name).toBe('Supino reto');
  });

  it('allows editing a custom exercise the user created', async () => {
    const created = await exerciseService.createCustomExercise({
      name: 'Exercício de teste',
      exerciseType: 'strength',
      primaryMuscles: ['chest'],
      secondaryMuscles: [],
      equipmentIds: [],
      trackingType: 'weightReps',
    });
    const updated = await exerciseService.updateExercise(created.id, { name: 'Nome atualizado' });
    expect(updated?.name).toBe('Nome atualizado');
  });

  it('allows favoriting and setting a preference on ANY exercise, custom or not', async () => {
    const favorited = await exerciseService.toggleFavoriteExercise('exercise-supino-reto');
    expect(favorited?.favorite).toBe(true);

    const preferred = await exerciseService.updateExercisePreference(
      'exercise-supino-reto',
      'preferred',
    );
    expect(preferred?.exercisePreference).toBe('preferred');
  });

  it('filters by muscle group, matching primary or secondary muscles', async () => {
    const results = await exerciseService.getExercises({ muscleGroup: 'triceps' });
    expect(results.some((exercise) => exercise.id === 'exercise-supino-reto')).toBe(true); // secondary muscle
    expect(results.some((exercise) => exercise.id === 'exercise-triceps-pulley')).toBe(true); // primary muscle
  });

  it('excludes archived exercises by default', async () => {
    await exerciseService.createCustomExercise({
      name: 'Exercício arquivável',
      exerciseType: 'strength',
      primaryMuscles: ['chest'],
      secondaryMuscles: [],
      equipmentIds: [],
      trackingType: 'weightReps',
    });
    const [created] = await exerciseService.getExercises({ query: 'arquivável' });
    await exerciseService.archiveExercise(created!.id);

    const visible = await exerciseService.getExercises({ query: 'arquivável' });
    expect(visible).toHaveLength(0);

    const withArchived = await exerciseService.getExercises({
      query: 'arquivável',
      includeArchived: true,
    });
    expect(withArchived).toHaveLength(1);
  });
});
