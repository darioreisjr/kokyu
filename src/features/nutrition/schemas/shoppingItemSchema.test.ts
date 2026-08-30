import { describe, expect, it } from 'vitest';

import { shoppingItemFormDefaultValues, shoppingItemSchema } from './shoppingItemSchema';

describe('shoppingItemSchema', () => {
  it('accepts an item identified by name (no ingredientId)', () => {
    const result = shoppingItemSchema.safeParse({
      ...shoppingItemFormDefaultValues,
      name: 'Guardanapo',
    });
    expect(result.success).toBe(true);
  });

  it('accepts an item identified by ingredientId (no name)', () => {
    const result = shoppingItemSchema.safeParse({
      ...shoppingItemFormDefaultValues,
      ingredientId: 'arroz',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an item with neither a name nor an ingredientId', () => {
    const result = shoppingItemSchema.safeParse(shoppingItemFormDefaultValues);
    expect(result.success).toBe(false);
  });

  it('rejects a non-positive quantity', () => {
    const result = shoppingItemSchema.safeParse({
      ...shoppingItemFormDefaultValues,
      name: 'Guardanapo',
      quantity: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a missing unit', () => {
    const result = shoppingItemSchema.safeParse({
      ...shoppingItemFormDefaultValues,
      name: 'Guardanapo',
      unit: '',
    });
    expect(result.success).toBe(false);
  });
});
