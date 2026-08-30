import { defaultMealTypes } from '../constants/mealTypes';
import { defaultStorageLocations } from '../constants/storageLocations';
import { mockIngredients } from '../mocks/ingredients.mock';
import { createMockMealQueue, createMockPlannedMeals } from '../mocks/mealPlan.mock';
import { createMockPantryItems } from '../mocks/pantryItems.mock';
import { mockRecipes } from '../mocks/recipes.mock';
import { createMockShoppingItems } from '../mocks/shoppingItems.mock';

/**
 * The single in-memory store every Nutrição service reads and writes
 * — mirrors how a real backend owns one data store, so swapping these
 * functions for real HTTP calls later means changing what's *inside*
 * each service function, not how services hand data to each other.
 * Never imported by a component directly; always go through a
 * `*Service` function.
 */
export const nutritionDb = {
  ingredients: [...mockIngredients],
  recipes: [...mockRecipes],
  pantryItems: createMockPantryItems(),
  plannedMeals: createMockPlannedMeals(),
  mealQueue: createMockMealQueue(),
  shoppingItems: createMockShoppingItems(),
  mealTypes: [...defaultMealTypes],
  storageLocations: [...defaultStorageLocations],
};

let nextId = 1;

/** Mock-only id generator — a real backend assigns its own ids; this just needs to be unique for one browser session. */
export function generateId(prefix: string): string {
  nextId += 1;
  return `${prefix}-${Date.now()}-${nextId}`;
}

/** Test-only — restores every table to a fresh copy of its starting mock data, so one test's writes never leak into the next. Never called from app code. */
export function resetNutritionDb(): void {
  nutritionDb.ingredients = [...mockIngredients];
  nutritionDb.recipes = [...mockRecipes];
  nutritionDb.pantryItems = createMockPantryItems();
  nutritionDb.plannedMeals = createMockPlannedMeals();
  nutritionDb.mealQueue = createMockMealQueue();
  nutritionDb.shoppingItems = createMockShoppingItems();
  nutritionDb.mealTypes = [...defaultMealTypes];
  nutritionDb.storageLocations = [...defaultStorageLocations];
}
