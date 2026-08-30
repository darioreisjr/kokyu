import type { IngredientCategoryId } from './ingredient.types';
import type { Unit } from './units.types';

/** Why an item ended up on the shopping list — lets the UI explain itself ("Adicionado do planejamento") instead of every item looking identically manual. */
export type ShoppingItemSource = 'manual' | 'recipe' | 'meal-plan' | 'low-stock' | 'out-of-stock';

export interface ShoppingItem {
  id: string;
  /** Omitted for a free-text household item (e.g. "Guardanapo") that isn't a recognized `Ingredient`. */
  ingredientId?: string;
  /** Only set when `ingredientId` is omitted — the display name for a generic item. */
  name?: string;
  quantity: number;
  unit: Unit;
  category: IngredientCategoryId;
  checked: boolean;
  source: ShoppingItemSource;
  recipeIds?: string[];
  plannedMealIds?: string[];
  notes?: string;
  /** Prepared for a future budgeting feature. */
  estimatedPrice?: number;
  actualPrice?: number;
  createdAt: string;
}
