import { addDays, format } from 'date-fns';

import type {
  MealQueueEntry,
  MealType,
  PlannedMeal,
  PlannedMealContentType,
  PlannedMealFoodItem,
} from '../types/mealPlan.types';
import { fromDateKey } from '../utils/dateHelpers';
import { generateId, nutritionDb } from './nutritionMockDb';

export interface PlannedMealInput {
  date: string;
  mealTypeId: string;
  time?: string;
  contentType: PlannedMealContentType;
  recipeId?: string;
  servings?: number;
  foodItems?: PlannedMealFoodItem[];
  note?: string;
  useLeftovers?: boolean;
}

export interface MovePlannedMealTarget {
  date?: string;
  mealTypeId?: string;
  time?: string;
}

/** Mocked — no real backend. */
export const mealPlanService = {
  async getMealTypes(): Promise<MealType[]> {
    return [...nutritionDb.mealTypes];
  },

  async getDailyMeals(date: string): Promise<PlannedMeal[]> {
    return nutritionDb.plannedMeals.filter((meal) => meal.date === date);
  },

  async getMealsInRange(startDate: string, endDate: string): Promise<PlannedMeal[]> {
    return nutritionDb.plannedMeals.filter(
      (meal) => meal.date >= startDate && meal.date <= endDate,
    );
  },

  /** Powers "Repetir refeição anterior" — the closest earlier planned meal of the same slot, or `null` when there's nothing to repeat. */
  async getMostRecentMealOfType(
    mealTypeId: string,
    beforeDate: string,
  ): Promise<PlannedMeal | null> {
    const candidates = nutritionDb.plannedMeals
      .filter((meal) => meal.mealTypeId === mealTypeId && meal.date < beforeDate)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    return candidates[0] ?? null;
  },

  async getWeeklyMealPlan(weekStartDate: string): Promise<PlannedMeal[]> {
    const weekEndDate = format(addDays(fromDateKey(weekStartDate), 6), 'yyyy-MM-dd');
    return mealPlanService.getMealsInRange(weekStartDate, weekEndDate);
  },

  async addPlannedMeal(input: PlannedMealInput): Promise<PlannedMeal> {
    const meal: PlannedMeal = {
      id: generateId('meal'),
      prepared: false,
      createdAt: new Date().toISOString(),
      ...input,
    };
    nutritionDb.plannedMeals.push(meal);
    return meal;
  },

  async updatePlannedMeal(
    id: string,
    patch: Partial<PlannedMealInput> & { prepared?: boolean },
  ): Promise<PlannedMeal | null> {
    const index = nutritionDb.plannedMeals.findIndex((meal) => meal.id === id);
    if (index === -1) return null;
    const updated: PlannedMeal = { ...nutritionDb.plannedMeals[index]!, ...patch };
    nutritionDb.plannedMeals[index] = updated;
    return updated;
  },

  async removePlannedMeal(id: string): Promise<void> {
    nutritionDb.plannedMeals = nutritionDb.plannedMeals.filter((meal) => meal.id !== id);
  },

  /** "Mover para..." — a thin, named wrapper over `updatePlannedMeal` so call sites read as an intent, not a generic patch. */
  async movePlannedMeal(id: string, target: MovePlannedMealTarget): Promise<PlannedMeal | null> {
    return mealPlanService.updatePlannedMeal(id, target);
  },

  /** "Copiar para outro dia" — one source meal fanned out to every target date, each a fresh (unprepared) copy. */
  async copyPlannedMeal(id: string, targetDates: string[]): Promise<PlannedMeal[]> {
    const source = nutritionDb.plannedMeals.find((meal) => meal.id === id);
    if (!source) return [];
    const now = new Date().toISOString();
    const copies = targetDates.map((date) => ({
      ...source,
      id: generateId('meal'),
      date,
      prepared: false,
      createdAt: now,
    }));
    nutritionDb.plannedMeals.push(...copies);
    return copies;
  },

  /** "Copiar este dia" — every meal on `sourceDate`, duplicated onto `targetDate`. */
  async duplicateDay(sourceDate: string, targetDate: string): Promise<PlannedMeal[]> {
    const sourceMeals = nutritionDb.plannedMeals.filter((meal) => meal.date === sourceDate);
    const now = new Date().toISOString();
    const copies = sourceMeals.map((meal) => ({
      ...meal,
      id: generateId('meal'),
      date: targetDate,
      prepared: false,
      createdAt: now,
    }));
    nutritionDb.plannedMeals.push(...copies);
    return copies;
  },

  /** "Limpar planejamento do dia" — the caller is responsible for confirming first when "Confirmar ações importantes" is on. */
  async clearDay(date: string): Promise<void> {
    nutritionDb.plannedMeals = nutritionDb.plannedMeals.filter((meal) => meal.date !== date);
  },

  async getMealQueue(): Promise<MealQueueEntry[]> {
    return [...nutritionDb.mealQueue];
  },

  async addToMealQueue(recipeId: string): Promise<MealQueueEntry> {
    const entry: MealQueueEntry = {
      id: generateId('queue'),
      recipeId,
      addedAt: new Date().toISOString(),
    };
    nutritionDb.mealQueue.push(entry);
    return entry;
  },

  async removeFromMealQueue(id: string): Promise<void> {
    nutritionDb.mealQueue = nutritionDb.mealQueue.filter((entry) => entry.id !== id);
  },

  /** Assigns a queued recipe to a real day/slot, then removes it from the queue — the recipe's own `servings` seeds the new planned meal. */
  async assignQueueEntryToDay(
    queueEntryId: string,
    date: string,
    mealTypeId: string,
  ): Promise<PlannedMeal | null> {
    const entry = nutritionDb.mealQueue.find((queueEntry) => queueEntry.id === queueEntryId);
    if (!entry) return null;
    const recipe = nutritionDb.recipes.find((candidate) => candidate.id === entry.recipeId);
    const meal = await mealPlanService.addPlannedMeal({
      date,
      mealTypeId,
      contentType: 'recipe',
      recipeId: entry.recipeId,
      servings: recipe?.servings,
    });
    nutritionDb.mealQueue = nutritionDb.mealQueue.filter(
      (queueEntry) => queueEntry.id !== queueEntryId,
    );
    return meal;
  },
};
