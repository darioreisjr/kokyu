import { addDays, format } from 'date-fns';

import type { MealQueueEntry, PlannedMeal } from '../types/mealPlan.types';

function dateKey(referenceDate: Date, offsetDays: number): string {
  return format(addDays(referenceDate, offsetDays), 'yyyy-MM-dd');
}

/**
 * A small, believable spread around "today" (`referenceDate`) rather
 * than a fixed calendar week — otherwise the demo data would read as
 * stale the day after it was written. Deliberately leaves gaps (e.g.
 * no jantar planned for some days) so the "Nenhuma refeição
 * planejada" empty state has something real to demonstrate too.
 */
export function createMockPlannedMeals(referenceDate: Date = new Date()): PlannedMeal[] {
  const createdAt = referenceDate.toISOString();
  return [
    {
      id: 'meal-today-cafe',
      date: dateKey(referenceDate, 0),
      mealTypeId: 'cafe-da-manha',
      contentType: 'recipe',
      recipeId: 'pao-com-ovo',
      servings: 1,
      prepared: true,
      createdAt,
    },
    {
      id: 'meal-today-almoco',
      date: dateKey(referenceDate, 0),
      mealTypeId: 'almoco',
      contentType: 'recipe',
      recipeId: 'frango-arroz-feijao',
      servings: 4,
      prepared: false,
      createdAt,
    },
    {
      id: 'meal-today-lanche',
      date: dateKey(referenceDate, 0),
      mealTypeId: 'lanche-da-tarde',
      contentType: 'food',
      foodItems: [{ ingredientId: 'banana', quantity: 1, unit: 'unidade' }],
      prepared: false,
      createdAt,
    },
    {
      id: 'meal-yesterday-jantar',
      date: dateKey(referenceDate, -1),
      mealTypeId: 'jantar',
      contentType: 'recipe',
      recipeId: 'macarrao-molho-tomate',
      servings: 3,
      prepared: true,
      createdAt,
    },
    {
      id: 'meal-tomorrow-cafe',
      date: dateKey(referenceDate, 1),
      mealTypeId: 'cafe-da-manha',
      contentType: 'recipe',
      recipeId: 'omelete-aveia',
      servings: 1,
      prepared: false,
      createdAt,
    },
    {
      id: 'meal-tomorrow-almoco',
      date: dateKey(referenceDate, 1),
      mealTypeId: 'almoco',
      contentType: 'note',
      note: 'Almoçar fora',
      prepared: false,
      createdAt,
    },
    {
      id: 'meal-tomorrow-jantar',
      date: dateKey(referenceDate, 1),
      mealTypeId: 'jantar',
      contentType: 'recipe',
      recipeId: 'frango-arroz-feijao',
      servings: 2,
      prepared: false,
      useLeftovers: true,
      createdAt,
    },
    {
      id: 'meal-plus2-almoco',
      date: dateKey(referenceDate, 2),
      mealTypeId: 'almoco',
      contentType: 'recipe',
      recipeId: 'macarrao-molho-tomate',
      servings: 3,
      prepared: false,
      createdAt,
    },
    {
      id: 'meal-plus3-cafe',
      date: dateKey(referenceDate, 3),
      mealTypeId: 'cafe-da-manha',
      contentType: 'recipe',
      recipeId: 'banana-com-aveia',
      servings: 1,
      prepared: false,
      createdAt,
    },
    {
      id: 'meal-plus3-jantar',
      date: dateKey(referenceDate, 3),
      mealTypeId: 'jantar',
      contentType: 'recipe',
      recipeId: 'frango-arroz-feijao',
      servings: 4,
      prepared: false,
      createdAt,
    },
  ];
}

/** Recipes queued for "some day this week," not yet assigned to a date. */
export function createMockMealQueue(referenceDate: Date = new Date()): MealQueueEntry[] {
  const addedAt = referenceDate.toISOString();
  return [
    { id: 'queue-1', recipeId: 'omelete-aveia', addedAt },
    { id: 'queue-2', recipeId: 'banana-com-aveia', addedAt },
  ];
}
