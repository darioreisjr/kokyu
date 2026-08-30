import { describe, expect, it } from 'vitest';

import { noteFormDefaultValues, noteSchema } from './noteSchema';

describe('noteSchema', () => {
  it('accepts the default values', () => {
    expect(noteSchema.safeParse(noteFormDefaultValues).success).toBe(true);
  });

  it('rejects an unknown note type', () => {
    const result = noteSchema.safeParse({ ...noteFormDefaultValues, type: 'invalid' });
    expect(result.success).toBe(false);
  });
});
