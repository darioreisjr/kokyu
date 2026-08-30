import { describe, expect, it } from 'vitest';

import { programFormDefaultValues, programFormSchema } from './programSchema';

const validBlock = {
  id: 'block-1',
  name: 'Bloco 1 — Acumulação',
  order: 1,
  type: 'accumulation' as const,
  weeks: [
    {
      id: 'week-1',
      order: 1,
      isDeload: false,
      weekdayRoutineIds: [
        null,
        'routine-push-a',
        null,
        'routine-pull-a',
        null,
        'routine-legs-a',
        null,
      ],
    },
  ],
};

describe('programFormSchema', () => {
  it('parses a valid program form with one block and one week', () => {
    const result = programFormSchema.safeParse({
      name: 'Hipertrofia — Fundamentos',
      description: 'Push/Pull/Legs',
      goal: 'hypertrophy',
      experienceLevel: 'intermediate',
      durationWeeks: 6,
      daysPerWeek: 3,
      blocks: [validBlock],
    });
    expect(result.success).toBe(true);
  });

  it('fails on its own default values, since an empty block list is not allowed', () => {
    expect(programFormSchema.safeParse(programFormDefaultValues).success).toBe(false);
  });

  it('fails when the name is empty', () => {
    const result = programFormSchema.safeParse({
      ...programFormDefaultValues,
      name: '',
      blocks: [validBlock],
    });
    expect(result.success).toBe(false);
  });

  it('fails when durationWeeks is missing', () => {
    const { durationWeeks: _durationWeeks, ...withoutDuration } = programFormDefaultValues;
    const result = programFormSchema.safeParse({
      ...withoutDuration,
      name: 'x',
      blocks: [validBlock],
    });
    expect(result.success).toBe(false);
  });

  it('fails when a week does not have exactly 7 weekday slots', () => {
    const result = programFormSchema.safeParse({
      ...programFormDefaultValues,
      name: 'x',
      blocks: [
        { ...validBlock, weeks: [{ ...validBlock.weeks[0], weekdayRoutineIds: [null, null] }] },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('fails on an invalid block type value', () => {
    const result = programFormSchema.safeParse({
      ...programFormDefaultValues,
      name: 'x',
      blocks: [{ ...validBlock, type: 'not-a-real-type' }],
    });
    expect(result.success).toBe(false);
  });
});
