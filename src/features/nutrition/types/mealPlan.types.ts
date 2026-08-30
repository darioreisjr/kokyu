import type { Unit } from './units.types';

/**
 * A slot in the day, not a fixed enum — the six defaults (Café da
 * manhã, Lanche da manhã, Almoço, Lanche da tarde, Jantar, Ceia) are
 * just `defaultMealTypes`'s starting data. `order`/`enabled` let a
 * future settings screen reorder, rename, add or disable slots
 * without touching every component that renders a meal.
 */
export interface MealType {
  id: string;
  name: string;
  order: number;
  /** `HH:mm`, shown as a suggestion when planning — never enforced. */
  defaultTime?: string;
  enabled: boolean;
}

export type PlannedMealContentType = 'recipe' | 'food' | 'note';

export interface PlannedMealFoodItem {
  ingredientId: string;
  quantity: number;
  unit: Unit;
}

/**
 * One planned meal. Exactly one of `recipeId`/`foodItems`/`note`
 * applies, matching `contentType` — a `recipe` meal never carries
 * `foodItems`, etc. Kept as a flat optional-fields shape (not a
 * discriminated union) because that's what a mock array of plain
 * objects can hold directly; components narrow on `contentType`.
 */
export interface PlannedMeal {
  id: string;
  /** `yyyy-MM-dd`, always local — never a full ISO datetime, which would drag UTC/timezone conversion into every read. */
  date: string;
  mealTypeId: string;
  /** `HH:mm` override of the meal type's `defaultTime`. */
  time?: string;
  contentType: PlannedMealContentType;
  recipeId?: string;
  /** Servings this planned instance uses — independent of the recipe's own default `servings`. */
  servings?: number;
  foodItems?: PlannedMealFoodItem[];
  note?: string;
  prepared: boolean;
  /** "Usar sobras" — a planning-time flag today; reducing pantry stock or skipping a shopping need for it is future work. */
  useLeftovers?: boolean;
  createdAt: string;
}

/** "Fila" — a recipe the user wants to cook but hasn't assigned to a day yet. Lives alongside the plan, not inside a `PlannedMeal` (it has no date). */
export interface MealQueueEntry {
  id: string;
  recipeId: string;
  addedAt: string;
}
