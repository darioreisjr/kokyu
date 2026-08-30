import { describe, expect, it } from 'vitest';

import { leisureItemFormDefaultValues, leisureItemSchema } from './leisureItemSchema';

describe('leisureItemSchema', () => {
  it('accepts the default values plus a title', () => {
    expect(
      leisureItemSchema.safeParse({ ...leisureItemFormDefaultValues, title: 'Interestelar' })
        .success,
    ).toBe(true);
  });

  it('rejects a missing title', () => {
    expect(leisureItemSchema.safeParse(leisureItemFormDefaultValues).success).toBe(false);
  });

  it('rejects an unknown type', () => {
    const result = leisureItemSchema.safeParse({
      ...leisureItemFormDefaultValues,
      title: 'X',
      type: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a negative estimatedDuration', () => {
    const result = leisureItemSchema.safeParse({
      ...leisureItemFormDefaultValues,
      title: 'X',
      estimatedDuration: -10,
    });
    expect(result.success).toBe(false);
  });
});
