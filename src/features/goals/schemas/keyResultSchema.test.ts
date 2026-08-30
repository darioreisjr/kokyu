import { describe, expect, it } from 'vitest';

import { keyResultFormDefaultValues, keyResultSchema } from './keyResultSchema';

describe('keyResultSchema', () => {
  it('accepts the default values plus a title', () => {
    expect(
      keyResultSchema.safeParse({
        ...keyResultFormDefaultValues,
        title: 'Concluir 2 cursos',
        target: 2,
      }).success,
    ).toBe(true);
  });

  it('rejects a missing title', () => {
    expect(keyResultSchema.safeParse(keyResultFormDefaultValues).success).toBe(false);
  });

  it('rejects a weight outside 0-100', () => {
    expect(
      keyResultSchema.safeParse({
        ...keyResultFormDefaultValues,
        title: 'KR',
        target: 1,
        weight: 150,
      }).success,
    ).toBe(false);
  });
});
