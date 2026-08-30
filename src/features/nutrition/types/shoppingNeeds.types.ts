import type { Unit } from './units.types';

/**
 * One consolidated ingredient need, the output of
 * `calculateShoppingNeeds()`. `neededQuantity`/`availableQuantity`/
 * `shortfallQuantity` all share one `unit` — the engine converts
 * every contributing recipe quantity into it before summing, so
 * "500g" + "1kg" reads as a single 1500g need, never two lines.
 */
export interface ShoppingNeedItem {
  ingredientId: string;
  neededQuantity: number;
  unit: Unit;
  availableQuantity: number;
  /** `max(neededQuantity - availableQuantity, 0)` — what actually has to be bought. */
  shortfallQuantity: number;
  sourceMealIds: string[];
  sourceRecipeIds: string[];
}

export interface ShoppingNeedsSummary {
  items: ShoppingNeedItem[];
  totalIngredients: number;
  /** Ingredients fully covered by the pantry (`shortfallQuantity === 0`). */
  alreadyInPantry: number;
  /** Ingredients needing a purchase (`shortfallQuantity > 0`). */
  needsPurchase: number;
}
