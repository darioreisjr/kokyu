import type { Ingredient } from '../types/ingredient.types';
import type { PantryItem } from '../types/pantry.types';
import type { PlannedMeal } from '../types/mealPlan.types';
import type { Recipe } from '../types/recipe.types';
import type { ShoppingItem, ShoppingItemSource } from '../types/shopping.types';
import type { ShoppingNeedItem, ShoppingNeedsSummary } from '../types/shoppingNeeds.types';
import type { Unit } from '../types/units.types';
import { convertUnit, toBaseUnit } from './unitConversion';

export interface CalculateShoppingNeedsInput {
  plannedMeals: PlannedMeal[];
  recipes: Recipe[];
  pantryItems: PantryItem[];
}

function roundQuantity(value: number): number {
  return Math.round(value * 100) / 100;
}

interface NeedAccumulator {
  ingredientId: string;
  unit: Unit;
  neededQuantity: number;
  sourceMealIds: Set<string>;
  sourceRecipeIds: Set<string>;
}

/**
 * The one place ingredient needs ever get computed — every "what do I
 * need to buy" surface (Hoje's summary, Planejamento's "Gerar lista de
 * compras", a recipe's "Adicionar faltantes às compras") funnels
 * through this instead of re-deriving its own version.
 *
 * Steps (matching the spec's own description): collect each planned
 * meal's ingredients (scaling a recipe's by its planned servings),
 * normalize compatible units (weight → g, volume → ml) so quantities
 * from different recipes actually sum instead of sitting as separate
 * lines, then subtract what the pantry already has — summed across
 * every storage location, converted into the need's own unit — to
 * get a shortfall. A meal marked `useLeftovers` contributes nothing:
 * reusing an already-prepared meal needs no new ingredients.
 *
 * Returns every needed ingredient, shortfall-zero ones included — the
 * "Necessário / Já tenho / Comprar" reconciliation view needs all
 * three groups, not just what's missing. `buildShoppingItemsFromNeeds`
 * is the step that narrows this down to what actually becomes a
 * `ShoppingItem`.
 */
export function calculateShoppingNeeds({
  plannedMeals,
  recipes,
  pantryItems,
}: CalculateShoppingNeedsInput): ShoppingNeedsSummary {
  const recipeById = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const accumulators = new Map<string, NeedAccumulator>();

  function addContribution(
    ingredientId: string,
    quantity: number,
    unit: Unit,
    mealId: string,
    recipeId?: string,
  ) {
    const normalized = toBaseUnit(quantity, unit);
    const key = `${ingredientId}::${normalized.unit}`;
    const existing = accumulators.get(key);
    if (existing) {
      existing.neededQuantity += normalized.quantity;
      existing.sourceMealIds.add(mealId);
      if (recipeId) existing.sourceRecipeIds.add(recipeId);
      return;
    }
    accumulators.set(key, {
      ingredientId,
      unit: normalized.unit,
      neededQuantity: normalized.quantity,
      sourceMealIds: new Set([mealId]),
      sourceRecipeIds: new Set(recipeId ? [recipeId] : []),
    });
  }

  for (const meal of plannedMeals) {
    if (meal.useLeftovers) continue;

    if (meal.contentType === 'recipe' && meal.recipeId) {
      const recipe = recipeById.get(meal.recipeId);
      if (!recipe || recipe.servings <= 0) continue;
      const servingsMultiplier = (meal.servings ?? recipe.servings) / recipe.servings;
      for (const recipeIngredient of recipe.ingredients) {
        addContribution(
          recipeIngredient.ingredientId,
          recipeIngredient.quantity * servingsMultiplier,
          recipeIngredient.unit,
          meal.id,
          recipe.id,
        );
      }
    } else if (meal.contentType === 'food' && meal.foodItems) {
      for (const foodItem of meal.foodItems) {
        addContribution(foodItem.ingredientId, foodItem.quantity, foodItem.unit, meal.id);
      }
    }
  }

  function getAvailableQuantity(ingredientId: string, unit: Unit): number {
    return pantryItems
      .filter((item) => item.ingredientId === ingredientId)
      .reduce((total, item) => {
        const converted = convertUnit(item.quantity, item.unit, unit);
        return converted === null ? total : total + converted;
      }, 0);
  }

  const items: ShoppingNeedItem[] = Array.from(accumulators.values()).map((accumulator) => {
    const availableQuantity = getAvailableQuantity(accumulator.ingredientId, accumulator.unit);
    const shortfallQuantity = Math.max(accumulator.neededQuantity - availableQuantity, 0);
    return {
      ingredientId: accumulator.ingredientId,
      neededQuantity: roundQuantity(accumulator.neededQuantity),
      unit: accumulator.unit,
      availableQuantity: roundQuantity(availableQuantity),
      shortfallQuantity: roundQuantity(shortfallQuantity),
      sourceMealIds: Array.from(accumulator.sourceMealIds),
      sourceRecipeIds: Array.from(accumulator.sourceRecipeIds),
    };
  });

  return {
    items,
    totalIngredients: items.length,
    alreadyInPantry: items.filter((item) => item.shortfallQuantity === 0).length,
    needsPurchase: items.filter((item) => item.shortfallQuantity > 0).length,
  };
}

/**
 * Narrows a `ShoppingNeedsSummary` down to actual `ShoppingItem`s —
 * only ingredients with a real shortfall, categorized via the
 * `Ingredient` lookup (needed because `ShoppingNeedItem` only ever
 * carries an `ingredientId`, never a denormalized category/name).
 */
export function buildShoppingItemsFromNeeds(
  summary: ShoppingNeedsSummary,
  ingredientsById: Map<string, Ingredient>,
  source: ShoppingItemSource,
  idFactory: () => string,
): ShoppingItem[] {
  const now = new Date().toISOString();
  return summary.items
    .filter((item) => item.shortfallQuantity > 0)
    .map((item) => {
      const ingredient = ingredientsById.get(item.ingredientId);
      return {
        id: idFactory(),
        ingredientId: item.ingredientId,
        quantity: item.shortfallQuantity,
        unit: item.unit,
        category: ingredient?.category ?? 'outros',
        checked: false,
        source,
        recipeIds: item.sourceRecipeIds.length > 0 ? item.sourceRecipeIds : undefined,
        plannedMealIds: item.sourceMealIds.length > 0 ? item.sourceMealIds : undefined,
        createdAt: now,
      } satisfies ShoppingItem;
    });
}
