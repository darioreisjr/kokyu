import { describe, expect, it } from 'vitest';

import { exerciseFormDefaultValues, exerciseFormSchema } from './exerciseSchema';

describe('exerciseFormSchema', () => {
  it('parses a valid exercise form', () => {
    const result = exerciseFormSchema.safeParse({
      name: 'Supino reto',
      exerciseType: 'strength',
      primaryMuscles: ['chest'],
      secondaryMuscles: ['triceps'],
      equipmentIds: ['equipment-barra'],
      trackingType: 'weightReps',
      instructions: '',
      personalNotes: '',
    });
    expect(result.success).toBe(true);
  });

  it('fails on its own default values, since an empty primaryMuscles list is not allowed', () => {
    expect(exerciseFormSchema.safeParse(exerciseFormDefaultValues).success).toBe(false);
    expect(
      exerciseFormSchema.safeParse({
        ...exerciseFormDefaultValues,
        name: 'x',
        primaryMuscles: ['chest'],
      }).success,
    ).toBe(true);
  });

  it('fails when the name is empty', () => {
    const result = exerciseFormSchema.safeParse({ ...exerciseFormDefaultValues, name: '' });
    expect(result.success).toBe(false);
  });

  it('fails when no primary muscle is selected', () => {
    const result = exerciseFormSchema.safeParse({
      ...exerciseFormDefaultValues,
      name: 'x',
      primaryMuscles: [],
    });
    expect(result.success).toBe(false);
  });

  it('fails on an invalid exerciseType value', () => {
    const result = exerciseFormSchema.safeParse({
      ...exerciseFormDefaultValues,
      name: 'x',
      primaryMuscles: ['chest'],
      exerciseType: 'not-a-real-type',
    });
    expect(result.success).toBe(false);
  });
});
