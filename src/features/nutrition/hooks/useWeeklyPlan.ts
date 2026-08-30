'use client';

import { useCallback, useEffect, useState } from 'react';

import { ingredientService } from '../services/ingredientService';
import { mealPlanService } from '../services/mealPlanService';
import { recipeService } from '../services/recipeService';
import type { Ingredient } from '../types/ingredient.types';
import type { MealQueueEntry, MealType, PlannedMeal } from '../types/mealPlan.types';
import type { Recipe } from '../types/recipe.types';
import { toDateKey } from '../utils/dateHelpers';

export type LoadStatus = 'loading' | 'ready' | 'error';

export interface UseWeeklyPlanResult {
  status: LoadStatus;
  mealTypes: MealType[];
  meals: PlannedMeal[];
  recipes: Recipe[];
  ingredients: Ingredient[];
  queue: MealQueueEntry[];
  reload: () => void;
}

/** Loads a full week (Monday–Sunday, or whatever `weekDays` covers) plus everything needed to render it — meal slots, recipes, ingredients, and the recipe queue. */
export function useWeeklyPlan(weekDays: Date[]): UseWeeklyPlanResult {
  const weekStartKey = weekDays[0] ? toDateKey(weekDays[0]) : '';
  const weekEndKey = weekDays[weekDays.length - 1] ? toDateKey(weekDays[weekDays.length - 1]!) : '';

  const [status, setStatus] = useState<LoadStatus>('loading');
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [meals, setMeals] = useState<PlannedMeal[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [queue, setQueue] = useState<MealQueueEntry[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!weekStartKey || !weekEndKey) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    Promise.all([
      mealPlanService.getMealTypes(),
      mealPlanService.getMealsInRange(weekStartKey, weekEndKey),
      recipeService.getRecipes(),
      ingredientService.getIngredients(),
      mealPlanService.getMealQueue(),
    ])
      .then(([loadedMealTypes, loadedMeals, loadedRecipes, loadedIngredients, loadedQueue]) => {
        if (cancelled) return;
        setMealTypes(loadedMealTypes);
        setMeals(loadedMeals);
        setRecipes(loadedRecipes);
        setIngredients(loadedIngredients);
        setQueue(loadedQueue);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [weekStartKey, weekEndKey, reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return { status, mealTypes, meals, recipes, ingredients, queue, reload };
}
