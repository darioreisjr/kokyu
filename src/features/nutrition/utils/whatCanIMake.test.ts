import { describe, expect, it } from 'vitest';

import type { PantryItem } from '../types/pantry.types';
import type { Recipe } from '../types/recipe.types';
import { calculateRecipeAvailability, rankRecipesByAvailability } from './whatCanIMake';

function recipe(id: string, ingredientIds: string[]): Recipe {
  return {
    id,
    name: id,
    category: 'almoco',
    tags: [],
    preparationTime: 10,
    cookingTime: 10,
    servings: 2,
    ingredients: ingredientIds.map((ingredientId) => ({ ingredientId, quantity: 100, unit: 'g' })),
    steps: [],
    favorite: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function pantryItem(ingredientId: string, quantity: number): PantryItem {
  return {
    id: `pantry-${ingredientId}`,
    ingredientId,
    quantity,
    unit: 'g',
    storageLocationId: 'despensa',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('calculateRecipeAvailability', () => {
  it('reports full availability when the pantry covers every ingredient (8/8)', () => {
    const eightIngredientRecipe = recipe(
      'recipe-a',
      Array.from({ length: 8 }, (_, index) => `ingredient-${index}`),
    );
    const pantry = eightIngredientRecipe.ingredients.map((ingredient) =>
      pantryItem(ingredient.ingredientId, 100),
    );

    const availability = calculateRecipeAvailability(eightIngredientRecipe, pantry);

    expect(availability).toMatchObject({
      totalIngredients: 8,
      availableIngredients: 8,
      canMakeFully: true,
      missingIngredientIds: [],
    });
  });

  it('reports one missing ingredient (7/8)', () => {
    const eightIngredientRecipe = recipe(
      'recipe-a',
      Array.from({ length: 8 }, (_, index) => `ingredient-${index}`),
    );
    const pantry = eightIngredientRecipe.ingredients
      .slice(0, 7)
      .map((ingredient) => pantryItem(ingredient.ingredientId, 100));

    const availability = calculateRecipeAvailability(eightIngredientRecipe, pantry);

    expect(availability.availableIngredients).toBe(7);
    expect(availability.canMakeFully).toBe(false);
    expect(availability.missingIngredientIds).toEqual(['ingredient-7']);
  });

  it('treats an ingredient with insufficient pantry quantity as missing, not available', () => {
    const oneIngredientRecipe = recipe('recipe-a', ['arroz']);
    oneIngredientRecipe.ingredients[0]!.quantity = 500;
    const pantry = [pantryItem('arroz', 100)];

    const availability = calculateRecipeAvailability(oneIngredientRecipe, pantry);

    expect(availability.canMakeFully).toBe(false);
  });
});

describe('rankRecipesByAvailability', () => {
  it('ranks fully-available recipes ahead of partially-available ones', () => {
    const fullyAvailable = recipe('full', ['a', 'b']);
    const partiallyAvailable = recipe('partial', ['a', 'b', 'c']);
    const pantry = [pantryItem('a', 100), pantryItem('b', 100)];

    const ranked = rankRecipesByAvailability([partiallyAvailable, fullyAvailable], pantry);

    expect(ranked[0]?.recipeId).toBe('full');
    expect(ranked[1]?.recipeId).toBe('partial');
  });
});
