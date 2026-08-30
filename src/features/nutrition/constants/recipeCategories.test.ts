import { describe, expect, it } from 'vitest';

import { getRecipeCategoryLabel, recipeCategoryDefinitions } from './recipeCategories';

describe('recipeCategories constants', () => {
  it('has 5 categories', () => {
    expect(recipeCategoryDefinitions).toHaveLength(5);
  });

  it('resolves a known category label', () => {
    expect(getRecipeCategoryLabel('almoco')).toBe('Almoço');
  });

  it('falls back to the raw value for an unknown category', () => {
    expect(getRecipeCategoryLabel('inexistente')).toBe('inexistente');
  });
});
