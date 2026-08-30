import { describe, expect, it } from 'vitest';

import { milestoneFormDefaultValues, milestoneSchema } from './milestoneSchema';

describe('milestoneSchema', () => {
  it('accepts the default values plus a title', () => {
    expect(
      milestoneSchema.safeParse({ ...milestoneFormDefaultValues, title: 'Definir o MVP' }).success,
    ).toBe(true);
  });

  it('rejects a missing title', () => {
    expect(milestoneSchema.safeParse(milestoneFormDefaultValues).success).toBe(false);
  });
});
