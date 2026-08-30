import { describe, expect, it } from 'vitest';

import { planEntryDefaultValues, planEntrySchema } from './planEntrySchema';

describe('planEntrySchema', () => {
  it('accepts a valid plan entry', () => {
    const result = planEntrySchema.safeParse({
      ...planEntryDefaultValues,
      title: 'Ler O Hobbit',
      date: '2030-01-01',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a missing title', () => {
    expect(
      planEntrySchema.safeParse({ ...planEntryDefaultValues, date: '2030-01-01' }).success,
    ).toBe(false);
  });

  it('rejects a missing date', () => {
    expect(
      planEntrySchema.safeParse({ ...planEntryDefaultValues, title: 'Ler O Hobbit' }).success,
    ).toBe(false);
  });

  it('rejects a negative duration', () => {
    const result = planEntrySchema.safeParse({
      ...planEntryDefaultValues,
      title: 'Ler',
      date: '2030-01-01',
      duration: -5,
    });
    expect(result.success).toBe(false);
  });
});
