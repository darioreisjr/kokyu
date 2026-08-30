'use client';

import { useCallback, useEffect, useState } from 'react';

import { ingredientService } from '../services/ingredientService';
import { mealPlanService } from '../services/mealPlanService';
import { recipeService } from '../services/recipeService';
import type { Ingredient } from '../types/ingredient.types';
import type { MealType, PlannedMeal } from '../types/mealPlan.types';
import type { Recipe } from '../types/recipe.types';
import { toDateKey } from '../utils/dateHelpers';

export type LoadStatus = 'loading' | 'ready' | 'error';

export interface UseDailyMealsResult {
  status: LoadStatus;
  mealTypes: MealType[];
  meals: PlannedMeal[];
  recipes: Recipe[];
  ingredients: Ingredient[];
  reload: () => void;
}

/** Loads everything the "Hoje" view needs for one date — meal slots, what's planned in them, and the recipes/ingredients those plans reference (for name/time/serving display). */
export function useDailyMeals(date: Date): UseDailyMealsResult {
  const dateKey = toDateKey(date);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [meals, setMeals] = useState<PlannedMeal[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    Promise.all([
      mealPlanService.getMealTypes(),
      mealPlanService.getDailyMeals(dateKey),
      recipeService.getRecipes(),
      ingredientService.getIngredients(),
    ])
      .then(([loadedMealTypes, loadedMeals, loadedRecipes, loadedIngredients]) => {
        if (cancelled) return;
        setMealTypes(loadedMealTypes);
        setMeals(loadedMeals);
        setRecipes(loadedRecipes);
        setIngredients(loadedIngredients);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [dateKey, reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return { status, mealTypes, meals, recipes, ingredients, reload };
}
