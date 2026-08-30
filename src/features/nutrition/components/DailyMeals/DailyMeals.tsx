'use client';

import Stack from '@mui/material/Stack';

import type { Ingredient } from '../../types/ingredient.types';
import type { MealType, PlannedMeal } from '../../types/mealPlan.types';
import type { Recipe } from '../../types/recipe.types';
import { getEnabledMealTypes } from '../../constants/mealTypes';
import { MealCard } from '../MealCard/MealCard';

export interface DailyMealsProps {
  mealTypes: MealType[];
  meals: PlannedMeal[];
  recipes: Recipe[];
  ingredientsById?: Map<string, Ingredient>;
  onAddMeal: (mealType: MealType) => void;
  onRemoveMeal: (meal: PlannedMeal) => void;
  onTogglePrepared: (meal: PlannedMeal) => void;
  onMoveMeal: (meal: PlannedMeal) => void;
}

/** One `MealCard` per enabled meal type — disabled types (a future settings surface) simply never render a slot. */
export function DailyMeals({
  mealTypes,
  meals,
  recipes,
  ingredientsById,
  onAddMeal,
  onRemoveMeal,
  onTogglePrepared,
  onMoveMeal,
}: DailyMealsProps) {
  const recipeById = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const mealsByType = new Map(meals.map((meal) => [meal.mealTypeId, meal]));

  return (
    <Stack spacing={2} component="ul" sx={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {getEnabledMealTypes(mealTypes).map((mealType) => {
        const meal = mealsByType.get(mealType.id);
        return (
          <li key={mealType.id}>
            <MealCard
              mealType={mealType}
              meal={meal}
              recipe={meal?.recipeId ? recipeById.get(meal.recipeId) : undefined}
              ingredientsById={ingredientsById}
              onAddMeal={() => onAddMeal(mealType)}
              onRemoveMeal={onRemoveMeal}
              onTogglePrepared={onTogglePrepared}
              onMoveMeal={onMoveMeal}
            />
          </li>
        );
      })}
    </Stack>
  );
}
