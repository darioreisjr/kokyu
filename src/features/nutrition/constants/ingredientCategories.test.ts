import { describe, expect, it } from 'vitest';

import { getIngredientCategoryLabel, ingredientCategoryDefinitions } from './ingredientCategories';

describe('ingredientCategories constants', () => {
  it('has 17 categories', () => {
    expect(ingredientCategoryDefinitions).toHaveLength(17);
  });

  it('resolves a known category label', () => {
    expect(getIngredientCategoryLabel('hortifruti')).toBe('Hortifruti');
  });

  it('falls back to the raw id for an unknown category', () => {
    // @ts-expect-error deliberately invalid category for the fallback path
    expect(getIngredientCategoryLabel('inexistente')).toBe('inexistente');
  });
});
