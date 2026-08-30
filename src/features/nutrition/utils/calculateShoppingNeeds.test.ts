import { describe, expect, it } from 'vitest';

import type { Ingredient } from '../types/ingredient.types';
import type { PantryItem } from '../types/pantry.types';
import type { PlannedMeal } from '../types/mealPlan.types';
import type { Recipe } from '../types/recipe.types';
import { buildShoppingItemsFromNeeds, calculateShoppingNeeds } from './calculateShoppingNeeds';

const arroz: Ingredient = {
  id: 'arroz',
  name: 'Arroz branco',
  normalizedName: 'arroz branco',
  category: 'graos',
  defaultUnit: 'g',
};

function recipe(overrides: Partial<Recipe> & Pick<Recipe, 'id' | 'ingredients'>): Recipe {
  return {
    name: 'Receita',
    description: undefined,
    category: 'almoco',
    tags: [],
    preparationTime: 10,
    cookingTime: 20,
    servings: 4,
    steps: [],
    favorite: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function plannedMeal(
  overrides: Partial<PlannedMeal> & Pick<PlannedMeal, 'id' | 'contentType'>,
): PlannedMeal {
  return {
    date: '2026-08-29',
    mealTypeId: 'almoco',
    prepared: false,
    createdAt: '2026-08-29T00:00:00.000Z',
    ...overrides,
  };
}

function pantryItem(
  overrides: Partial<PantryItem> & Pick<PantryItem, 'id' | 'ingredientId' | 'quantity' | 'unit'>,
): PantryItem {
  return {
    storageLocationId: 'despensa',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('calculateShoppingNeeds', () => {
  it('consolidates the same ingredient across two recipes and subtracts the pantry (spec example: 700g arroz)', () => {
    const recipeA = recipe({
      id: 'recipe-a',
      ingredients: [{ ingredientId: 'arroz', quantity: 500, unit: 'g' }],
    });
    const recipeB = recipe({
      id: 'recipe-b',
      ingredients: [{ ingredientId: 'arroz', quantity: 500, unit: 'g' }],
    });
    const meals: PlannedMeal[] = [
      plannedMeal({ id: 'meal-1', contentType: 'recipe', recipeId: 'recipe-a' }),
      plannedMeal({ id: 'meal-2', contentType: 'recipe', recipeId: 'recipe-b' }),
    ];
    const pantry: PantryItem[] = [
      pantryItem({ id: 'p1', ingredientId: 'arroz', quantity: 300, unit: 'g' }),
    ];

    const summary = calculateShoppingNeeds({
      plannedMeals: meals,
      recipes: [recipeA, recipeB],
      pantryItems: pantry,
    });

    expect(summary.items).toHaveLength(1);
    expect(summary.items[0]).toMatchObject({
      ingredientId: 'arroz',
      neededQuantity: 1000,
      unit: 'g',
      availableQuantity: 300,
      shortfallQuantity: 700,
    });
  });

  it('consolidates compatible units (500g + 1kg = 1500g)', () => {
    const recipeA = recipe({
      id: 'recipe-a',
      ingredients: [{ ingredientId: 'arroz', quantity: 500, unit: 'g' }],
    });
    const recipeB = recipe({
      id: 'recipe-b',
      ingredients: [{ ingredientId: 'arroz', quantity: 1, unit: 'kg' }],
    });
    const meals: PlannedMeal[] = [
      plannedMeal({ id: 'meal-1', contentType: 'recipe', recipeId: 'recipe-a' }),
      plannedMeal({ id: 'meal-2', contentType: 'recipe', recipeId: 'recipe-b' }),
    ];

    const summary = calculateShoppingNeeds({
      plannedMeals: meals,
      recipes: [recipeA, recipeB],
      pantryItems: [],
    });

    expect(summary.items).toHaveLength(1);
    expect(summary.items[0]?.neededQuantity).toBe(1500);
    expect(summary.items[0]?.unit).toBe('g');
  });

  it('does not add an ingredient to the shopping list when the pantry already covers it (500g needed, 700g in pantry)', () => {
    const recipeA = recipe({
      id: 'recipe-a',
      ingredients: [{ ingredientId: 'arroz', quantity: 500, unit: 'g' }],
    });
    const meals: PlannedMeal[] = [
      plannedMeal({ id: 'meal-1', contentType: 'recipe', recipeId: 'recipe-a' }),
    ];
    const pantry: PantryItem[] = [
      pantryItem({ id: 'p1', ingredientId: 'arroz', quantity: 700, unit: 'g' }),
    ];

    const summary = calculateShoppingNeeds({
      plannedMeals: meals,
      recipes: [recipeA],
      pantryItems: pantry,
    });

    expect(summary.items[0]?.shortfallQuantity).toBe(0);
    expect(summary.needsPurchase).toBe(0);
    expect(summary.alreadyInPantry).toBe(1);

    const ingredientsById = new Map([[arroz.id, arroz]]);
    const shoppingItems = buildShoppingItemsFromNeeds(
      summary,
      ingredientsById,
      'meal-plan',
      () => 'id',
    );
    expect(shoppingItems).toHaveLength(0);
  });

  it('computes a partial shortfall (500g needed, 200g in pantry → 300g)', () => {
    const recipeA = recipe({
      id: 'recipe-a',
      ingredients: [{ ingredientId: 'arroz', quantity: 500, unit: 'g' }],
    });
    const meals: PlannedMeal[] = [
      plannedMeal({ id: 'meal-1', contentType: 'recipe', recipeId: 'recipe-a' }),
    ];
    const pantry: PantryItem[] = [
      pantryItem({ id: 'p1', ingredientId: 'arroz', quantity: 200, unit: 'g' }),
    ];

    const summary = calculateShoppingNeeds({
      plannedMeals: meals,
      recipes: [recipeA],
      pantryItems: pantry,
    });

    expect(summary.items[0]?.shortfallQuantity).toBe(300);
  });

  it('scales a recipe planned for more servings than its default', () => {
    const recipeA = recipe({
      id: 'recipe-a',
      servings: 4,
      ingredients: [{ ingredientId: 'arroz', quantity: 400, unit: 'g' }],
    });
    const meals: PlannedMeal[] = [
      plannedMeal({ id: 'meal-1', contentType: 'recipe', recipeId: 'recipe-a', servings: 8 }),
    ];

    const summary = calculateShoppingNeeds({
      plannedMeals: meals,
      recipes: [recipeA],
      pantryItems: [],
    });

    // 400g for 4 servings, planned for 8 → 800g.
    expect(summary.items[0]?.neededQuantity).toBe(800);
  });

  it('sums pantry stock for the same ingredient across multiple storage locations', () => {
    const recipeA = recipe({
      id: 'recipe-a',
      ingredients: [{ ingredientId: 'arroz', quantity: 500, unit: 'g' }],
    });
    const meals: PlannedMeal[] = [
      plannedMeal({ id: 'meal-1', contentType: 'recipe', recipeId: 'recipe-a' }),
    ];
    const pantry: PantryItem[] = [
      pantryItem({
        id: 'p1',
        ingredientId: 'arroz',
        quantity: 100,
        unit: 'g',
        storageLocationId: 'despensa',
      }),
      pantryItem({
        id: 'p2',
        ingredientId: 'arroz',
        quantity: 100,
        unit: 'g',
        storageLocationId: 'freezer',
      }),
    ];

    const summary = calculateShoppingNeeds({
      plannedMeals: meals,
      recipes: [recipeA],
      pantryItems: pantry,
    });

    expect(summary.items[0]?.availableQuantity).toBe(200);
    expect(summary.items[0]?.shortfallQuantity).toBe(300);
  });

  it('includes simple food items (not just recipes) planned directly', () => {
    const meals: PlannedMeal[] = [
      plannedMeal({
        id: 'meal-1',
        contentType: 'food',
        foodItems: [{ ingredientId: 'arroz', quantity: 250, unit: 'g' }],
      }),
    ];

    const summary = calculateShoppingNeeds({ plannedMeals: meals, recipes: [], pantryItems: [] });

    expect(summary.items[0]?.neededQuantity).toBe(250);
  });

  it('excludes a meal marked "usar sobras" from ingredient needs', () => {
    const recipeA = recipe({
      id: 'recipe-a',
      ingredients: [{ ingredientId: 'arroz', quantity: 500, unit: 'g' }],
    });
    const meals: PlannedMeal[] = [
      plannedMeal({
        id: 'meal-1',
        contentType: 'recipe',
        recipeId: 'recipe-a',
        useLeftovers: true,
      }),
    ];

    const summary = calculateShoppingNeeds({
      plannedMeals: meals,
      recipes: [recipeA],
      pantryItems: [],
    });

    expect(summary.items).toHaveLength(0);
  });

  it('ignores a note-only meal — it has no ingredients to contribute', () => {
    const meals: PlannedMeal[] = [
      plannedMeal({ id: 'meal-1', contentType: 'note', note: 'Almoçar fora' }),
    ];

    const summary = calculateShoppingNeeds({ plannedMeals: meals, recipes: [], pantryItems: [] });

    expect(summary.items).toHaveLength(0);
  });

  it("does not convert pantry stock in an incompatible unit group into the need's unit", () => {
    const recipeA = recipe({
      id: 'recipe-a',
      ingredients: [{ ingredientId: 'arroz', quantity: 500, unit: 'g' }],
    });
    const meals: PlannedMeal[] = [
      plannedMeal({ id: 'meal-1', contentType: 'recipe', recipeId: 'recipe-a' }),
    ];
    // A pantry entry for the same ingredient logged in an incompatible group (count) must not be treated as weight stock.
    const pantry: PantryItem[] = [
      pantryItem({ id: 'p1', ingredientId: 'arroz', quantity: 2, unit: 'pacote' }),
    ];

    const summary = calculateShoppingNeeds({
      plannedMeals: meals,
      recipes: [recipeA],
      pantryItems: pantry,
    });

    expect(summary.items[0]?.availableQuantity).toBe(0);
    expect(summary.items[0]?.shortfallQuantity).toBe(500);
  });

  it('builds real ShoppingItems only for ingredients with an actual shortfall, tagged with their category and source', () => {
    const recipeA = recipe({
      id: 'recipe-a',
      ingredients: [{ ingredientId: 'arroz', quantity: 500, unit: 'g' }],
    });
    const meals: PlannedMeal[] = [
      plannedMeal({ id: 'meal-1', contentType: 'recipe', recipeId: 'recipe-a' }),
    ];

    const summary = calculateShoppingNeeds({
      plannedMeals: meals,
      recipes: [recipeA],
      pantryItems: [],
    });
    const ingredientsById = new Map([[arroz.id, arroz]]);
    let idCounter = 0;
    const shoppingItems = buildShoppingItemsFromNeeds(
      summary,
      ingredientsById,
      'meal-plan',
      () => `shopping-${(idCounter += 1)}`,
    );

    expect(shoppingItems).toHaveLength(1);
    expect(shoppingItems[0]).toMatchObject({
      ingredientId: 'arroz',
      quantity: 500,
      unit: 'g',
      category: 'graos',
      checked: false,
      source: 'meal-plan',
      recipeIds: ['recipe-a'],
      plannedMealIds: ['meal-1'],
    });
  });
});
