import { describe, expect, it } from 'vitest';

import { pantryItemFormDefaultValues, pantryItemSchema } from './pantrySchema';

describe('pantryItemSchema', () => {
  it('accepts the default form values plus a real ingredient id', () => {
    const result = pantryItemSchema.safeParse({
      ...pantryItemFormDefaultValues,
      ingredientId: 'arroz',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a missing ingredient', () => {
    const result = pantryItemSchema.safeParse({ ...pantryItemFormDefaultValues, ingredientId: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a negative quantity', () => {
    const result = pantryItemSchema.safeParse({
      ...pantryItemFormDefaultValues,
      ingredientId: 'arroz',
      quantity: -1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a missing storage location', () => {
    const result = pantryItemSchema.safeParse({
      ...pantryItemFormDefaultValues,
      ingredientId: 'arroz',
      storageLocationId: '',
    });
    expect(result.success).toBe(false);
  });

  it('coerces string quantities into numbers', () => {
    const result = pantryItemSchema.safeParse({
      ...pantryItemFormDefaultValues,
      ingredientId: 'arroz',
      quantity: '5',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.quantity).toBe(5);
  });
});
