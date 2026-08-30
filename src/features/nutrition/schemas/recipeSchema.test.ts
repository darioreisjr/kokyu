import { describe, expect, it } from 'vitest';

import { recipeFormDefaultValues, recipeSchema } from './recipeSchema';

function validRecipe() {
  return {
    name: 'Salada de tomate',
    description: '',
    category: 'almoco' as const,
    tags: [],
    preparationTime: 10,
    cookingTime: 0,
    servings: 2,
    ingredients: [{ ingredientName: 'Tomate', quantity: 2, unit: 'unidade' as const }],
    steps: [{ text: 'Corte o tomate.' }],
    notes: '',
  };
}

describe('recipeSchema', () => {
  it('accepts a fully valid recipe', () => {
    expect(recipeSchema.safeParse(validRecipe()).success).toBe(true);
  });

  it('rejects a missing name', () => {
    const result = recipeSchema.safeParse({ ...validRecipe(), name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects zero or negative servings', () => {
    const result = recipeSchema.safeParse({ ...validRecipe(), servings: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects a recipe with no ingredients', () => {
    const result = recipeSchema.safeParse({ ...validRecipe(), ingredients: [] });
    expect(result.success).toBe(false);
  });

  it('rejects a recipe with no steps', () => {
    const result = recipeSchema.safeParse({ ...validRecipe(), steps: [] });
    expect(result.success).toBe(false);
  });

  it('rejects an ingredient row with a non-positive quantity', () => {
    const result = recipeSchema.safeParse({
      ...validRecipe(),
      ingredients: [{ ingredientName: 'Tomate', quantity: 0, unit: 'unidade' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown unit', () => {
    const result = recipeSchema.safeParse({
      ...validRecipe(),
      ingredients: [{ ingredientName: 'Tomate', quantity: 1, unit: 'xicaras-invalidas' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown category', () => {
    const result = recipeSchema.safeParse({ ...validRecipe(), category: 'sobremesa-invalida' });
    expect(result.success).toBe(false);
  });

  it('ships default values that pass validation once name/ingredients/steps are filled in', () => {
    expect(
      recipeSchema.safeParse({
        ...recipeFormDefaultValues,
        name: 'Arroz com feijão',
        ingredients: [{ ingredientName: 'Arroz', quantity: 1, unit: 'kg' }],
        steps: [{ text: 'Cozinhe.' }],
      }).success,
    ).toBe(true);
  });
});
