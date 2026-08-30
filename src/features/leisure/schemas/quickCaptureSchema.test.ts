import { describe, expect, it } from 'vitest';

import { quickCaptureDefaultValues, quickCaptureSchema } from './quickCaptureSchema';

describe('quickCaptureSchema', () => {
  it('accepts just a title, per "não obrigar preencher todos os metadados"', () => {
    expect(
      quickCaptureSchema.safeParse({
        ...quickCaptureDefaultValues,
        title: 'Filme que o Bruno recomendou',
      }).success,
    ).toBe(true);
  });

  it('rejects an empty title', () => {
    expect(quickCaptureSchema.safeParse(quickCaptureDefaultValues).success).toBe(false);
  });
});
