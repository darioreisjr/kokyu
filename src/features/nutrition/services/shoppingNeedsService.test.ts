import { beforeEach, describe, expect, it } from 'vitest';

import { mealPlanService } from './mealPlanService';
import { resetNutritionDb } from './nutritionMockDb';
import { getShoppingNeedsForRange, getShoppingNeedsForRecipe } from './shoppingNeedsService';

beforeEach(() => {
  resetNutritionDb();
});

describe('getShoppingNeedsForRange', () => {
  it('reflects meals actually planned within the given range', async () => {
    await mealPlanService.addPlannedMeal({
      date: '2026-09-01',
      mealTypeId: 'jantar',
      contentType: 'recipe',
      recipeId: 'macarrao-molho-tomate',
      servings: 3,
    });

    const summary = await getShoppingNeedsForRange('2026-09-01', '2026-09-01');

    expect(summary.items.some((item) => item.ingredientId === 'macarrao')).toBe(true);
  });

  it('returns an empty summary for a range with nothing planned', async () => {
    const summary = await getShoppingNeedsForRange('2030-01-01', '2030-01-01');
    expect(summary.items).toHaveLength(0);
  });
});

describe('getShoppingNeedsForRecipe', () => {
  it('computes needs for one recipe at its own default servings', async () => {
    const summary = await getShoppingNeedsForRecipe('macarrao-molho-tomate');
    expect(summary.totalIngredients).toBeGreaterThan(0);
  });

  it('scales needs when a different serving count is requested', async () => {
    const atDefault = await getShoppingNeedsForRecipe('macarrao-molho-tomate', 3);
    const doubled = await getShoppingNeedsForRecipe('macarrao-molho-tomate', 6);

    const macarraoAtDefault = atDefault.items.find((item) => item.ingredientId === 'macarrao');
    const macarraoDoubled = doubled.items.find((item) => item.ingredientId === 'macarrao');

    expect(macarraoDoubled?.neededQuantity).toBe((macarraoAtDefault?.neededQuantity ?? 0) * 2);
  });

  it('returns an empty summary for an unknown recipe', async () => {
    const summary = await getShoppingNeedsForRecipe('does-not-exist');
    expect(summary.items).toHaveLength(0);
  });
});
