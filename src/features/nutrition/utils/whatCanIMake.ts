import type { PantryItem } from '../types/pantry.types';
import type { Recipe } from '../types/recipe.types';
import { convertUnit } from './unitConversion';

export interface RecipeAvailability {
  recipeId: string;
  totalIngredients: number;
  availableIngredients: number;
  missingIngredientIds: string[];
  canMakeFully: boolean;
}

/**
 * "O que posso preparar?" — a plain ratio of ingredients the pantry
 * already covers vs. what the recipe needs, nothing smarter. No AI,
 * per the spec: `8/8` reads as "Você tem tudo", `7/8` as "Falta 1
 * ingrediente".
 */
export function calculateRecipeAvailability(
  recipe: Recipe,
  pantryItems: PantryItem[],
): RecipeAvailability {
  const missingIngredientIds: string[] = [];

  for (const recipeIngredient of recipe.ingredients) {
    const availableQuantity = pantryItems
      .filter((item) => item.ingredientId === recipeIngredient.ingredientId)
      .reduce((total, item) => {
        const converted = convertUnit(item.quantity, item.unit, recipeIngredient.unit);
        return converted === null ? total : total + converted;
      }, 0);

    if (availableQuantity < recipeIngredient.quantity) {
      missingIngredientIds.push(recipeIngredient.ingredientId);
    }
  }

  const totalIngredients = recipe.ingredients.length;
  const availableIngredients = totalIngredients - missingIngredientIds.length;

  return {
    recipeId: recipe.id,
    totalIngredients,
    availableIngredients,
    missingIngredientIds,
    canMakeFully: missingIngredientIds.length === 0,
  };
}

/** Highest ingredient-coverage ratio first — "Tenho tudo" recipes surface before "Falta pouco" ones. */
export function rankRecipesByAvailability(
  recipes: Recipe[],
  pantryItems: PantryItem[],
): RecipeAvailability[] {
  return recipes
    .map((recipe) => calculateRecipeAvailability(recipe, pantryItems))
    .sort((a, b) => {
      const ratioA = a.totalIngredients === 0 ? 1 : a.availableIngredients / a.totalIngredients;
      const ratioB = b.totalIngredients === 0 ? 1 : b.availableIngredients / b.totalIngredients;
      return ratioB - ratioA;
    });
}
