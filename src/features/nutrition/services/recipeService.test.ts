import { beforeEach, describe, expect, it } from 'vitest';

import { resetNutritionDb } from './nutritionMockDb';
import { recipeService } from './recipeService';

beforeEach(() => {
  resetNutritionDb();
});

const baseInput = {
  name: 'Salada simples',
  category: 'almoco' as const,
  tags: ['rápido'],
  preparationTime: 5,
  cookingTime: 0,
  servings: 2,
  ingredients: [{ ingredientId: 'tomate', quantity: 2, unit: 'unidade' as const }],
  steps: [{ text: 'Corte o tomate.' }],
};

describe('recipeService', () => {
  it('creates a recipe', async () => {
    const recipe = await recipeService.createRecipe(baseInput);

    expect(recipe.name).toBe('Salada simples');
    expect(recipe.favorite).toBe(false);
    expect(recipe.steps[0]?.order).toBe(0);
    expect(await recipeService.getRecipe(recipe.id)).toMatchObject({ name: 'Salada simples' });
  });

  it('edits a recipe', async () => {
    const recipe = await recipeService.createRecipe(baseInput);

    const updated = await recipeService.updateRecipe(recipe.id, {
      ...baseInput,
      name: 'Salada completa',
      servings: 4,
    });

    expect(updated?.name).toBe('Salada completa');
    expect(updated?.servings).toBe(4);
    expect(updated?.createdAt).toBe(recipe.createdAt);
  });

  it('removes a recipe', async () => {
    const recipe = await recipeService.createRecipe(baseInput);

    await recipeService.deleteRecipe(recipe.id);

    expect(await recipeService.getRecipe(recipe.id)).toBeNull();
  });

  it('toggles favorite on and off', async () => {
    const recipe = await recipeService.createRecipe(baseInput);
    expect(recipe.favorite).toBe(false);

    const favorited = await recipeService.toggleFavorite(recipe.id);
    expect(favorited?.favorite).toBe(true);

    const unfavorited = await recipeService.toggleFavorite(recipe.id);
    expect(unfavorited?.favorite).toBe(false);
  });
});
