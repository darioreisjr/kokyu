import { describe, expect, it } from 'vitest';

import { routineFormDefaultValues, routineFormSchema } from './routineSchema';

const validExercise = {
  id: 're-1',
  exerciseId: 'exercise-supino-reto',
  order: 1,
  sets: [
    {
      id: 'set-1',
      order: 1,
      setType: 'working' as const,
      targetReps: 8,
      targetLoadKg: 60,
      restSeconds: 90,
    },
  ],
  progressionStrategy: 'manual' as const,
};

describe('routineFormSchema', () => {
  it('parses a valid routine form with one exercise and one set', () => {
    const result = routineFormSchema.safeParse({
      name: 'Push A',
      description: 'Peito, ombros e tríceps.',
      goal: 'hypertrophy',
      estimatedDurationMinutes: 60,
      locationId: 'location-academia',
      exercises: [validExercise],
    });
    expect(result.success).toBe(true);
  });

  it('fails on its own default values, since an empty exercise list is not allowed', () => {
    expect(routineFormSchema.safeParse(routineFormDefaultValues).success).toBe(false);
  });

  it('fails when the name is empty', () => {
    const result = routineFormSchema.safeParse({
      ...routineFormDefaultValues,
      name: '',
      exercises: [validExercise],
    });
    expect(result.success).toBe(false);
  });

  it('fails when an exercise has no exerciseId selected', () => {
    const result = routineFormSchema.safeParse({
      ...routineFormDefaultValues,
      name: 'Push A',
      exercises: [{ ...validExercise, exerciseId: '' }],
    });
    expect(result.success).toBe(false);
  });

  it('fails when an exercise has zero sets', () => {
    const result = routineFormSchema.safeParse({
      ...routineFormDefaultValues,
      name: 'Push A',
      exercises: [{ ...validExercise, sets: [] }],
    });
    expect(result.success).toBe(false);
  });

  it('fails on an invalid setType value', () => {
    const result = routineFormSchema.safeParse({
      ...routineFormDefaultValues,
      name: 'Push A',
      exercises: [
        { ...validExercise, sets: [{ ...validExercise.sets[0], setType: 'not-a-real-type' }] },
      ],
    });
    expect(result.success).toBe(false);
  });
});
