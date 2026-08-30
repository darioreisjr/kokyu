import type { Unit } from './units.types';
import type { NutritionFacts } from './nutritionFacts.types';

/** A simpler, meal-time-oriented classification than `MealType` — used for the Receitas library's own filters, not the planner's meal slots. */
export type RecipeCategoryId = 'cafe-da-manha' | 'almoco' | 'jantar' | 'lanche' | 'sobremesa';

export interface RecipeCategoryDefinition {
  id: RecipeCategoryId;
  label: string;
  order: number;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
  unit: Unit;
  preparationNote?: string;
}

export interface RecipeStep {
  id: string;
  order: number;
  text: string;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  category: RecipeCategoryId;
  tags: string[];
  /** Minutes. */
  preparationTime: number;
  /** Minutes. */
  cookingTime: number;
  servings: number;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  notes?: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  /** Prepared — see `NutritionFacts`'s own doc comment. */
  nutritionFacts?: NutritionFacts;
  /** Prepared for a future "Importar receita" flow. */
  sourceUrl?: string;
}

/** `preparationTime + cookingTime` — always derived, never stored, so the two never drift apart from their own sum. */
export function getRecipeTotalTime(
  recipe: Pick<Recipe, 'preparationTime' | 'cookingTime'>,
): number {
  return recipe.preparationTime + recipe.cookingTime;
}
