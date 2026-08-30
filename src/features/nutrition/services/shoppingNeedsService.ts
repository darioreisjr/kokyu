import type { ShoppingNeedsSummary } from '../types/shoppingNeeds.types';
import { calculateShoppingNeeds } from '../utils/calculateShoppingNeeds';
import { mealPlanService } from './mealPlanService';
import { nutritionDb } from './nutritionMockDb';

/**
 * The service-layer entry point to the calculation engine — pulls the
 * three inputs it needs (planned meals in range, every recipe, the
 * live pantry) from the mock store and hands them to the pure
 * `calculateShoppingNeeds`, so a component never assembles those
 * three lists itself.
 */
export async function getShoppingNeedsForRange(
  startDate: string,
  endDate: string,
): Promise<ShoppingNeedsSummary> {
  const plannedMeals = await mealPlanService.getMealsInRange(startDate, endDate);
  return calculateShoppingNeeds({
    plannedMeals,
    recipes: nutritionDb.recipes,
    pantryItems: nutritionDb.pantryItems,
  });
}

/** For one recipe's own "Adicionar faltantes às compras" — reuses the exact same engine with a single synthetic planned meal instead of a second calculation path. */
export async function getShoppingNeedsForRecipe(
  recipeId: string,
  servings?: number,
): Promise<ShoppingNeedsSummary> {
  const recipe = nutritionDb.recipes.find((candidate) => candidate.id === recipeId);
  if (!recipe) return { items: [], totalIngredients: 0, alreadyInPantry: 0, needsPurchase: 0 };

  return calculateShoppingNeeds({
    plannedMeals: [
      {
        id: `preview-${recipeId}`,
        date: new Date().toISOString().slice(0, 10),
        mealTypeId: 'almoco',
        contentType: 'recipe',
        recipeId,
        servings: servings ?? recipe.servings,
        prepared: false,
        createdAt: new Date().toISOString(),
      },
    ],
    recipes: nutritionDb.recipes,
    pantryItems: nutritionDb.pantryItems,
  });
}
