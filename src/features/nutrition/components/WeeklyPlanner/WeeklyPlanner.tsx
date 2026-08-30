'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import type { Ingredient } from '../../types/ingredient.types';
import type { MealType, PlannedMeal } from '../../types/mealPlan.types';
import type { Recipe } from '../../types/recipe.types';
import { toDateKey } from '../../utils/dateHelpers';
import { DailyMeals } from '../DailyMeals/DailyMeals';
import { WeekdaySelector } from '../WeekdaySelector/WeekdaySelector';
import { DesktopWeekGrid } from './DesktopWeekGrid';
import { TabletWeekCards } from './TabletWeekCards';

export interface WeeklyPlannerProps {
  weekDays: Date[];
  mealTypes: MealType[];
  meals: PlannedMeal[];
  recipes: Recipe[];
  ingredientsById: Map<string, Ingredient>;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onSlotClick: (date: Date, mealType: MealType, meal?: PlannedMeal) => void;
  onAddMeal: (mealType: MealType) => void;
  onRemoveMeal: (meal: PlannedMeal) => void;
  onTogglePrepared: (meal: PlannedMeal) => void;
  onMoveMeal: (meal: PlannedMeal) => void;
}

/**
 * Three layouts sharing one week of data, switched purely by CSS
 * breakpoint (all three render, only one is ever visible) — the same
 * SSR-safe pattern `KokyuAppShell` uses, so there's nothing here that
 * can mismatch between server and client. Mobile reuses `DailyMeals`/
 * `MealCard` directly (full detail, one day); tablet/desktop use the
 * more compact grid/card chips, since seven full `MealCard`s per day
 * would never fit.
 */
export function WeeklyPlanner({
  weekDays,
  mealTypes,
  meals,
  recipes,
  ingredientsById,
  selectedDate,
  onSelectDate,
  onSlotClick,
  onAddMeal,
  onRemoveMeal,
  onTogglePrepared,
  onMoveMeal,
}: WeeklyPlannerProps) {
  const selectedDateKey = toDateKey(selectedDate);
  const mealsForSelectedDate = meals.filter((meal) => meal.date === selectedDateKey);

  return (
    <>
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        <Stack spacing={3}>
          <WeekdaySelector
            weekDays={weekDays}
            selectedDate={selectedDate}
            onSelect={onSelectDate}
          />
          <DailyMeals
            mealTypes={mealTypes}
            meals={mealsForSelectedDate}
            recipes={recipes}
            ingredientsById={ingredientsById}
            onAddMeal={onAddMeal}
            onRemoveMeal={onRemoveMeal}
            onTogglePrepared={onTogglePrepared}
            onMoveMeal={onMoveMeal}
          />
        </Stack>
      </Box>

      <Box sx={{ display: { xs: 'none', sm: 'block', lg: 'none' } }}>
        <TabletWeekCards
          weekDays={weekDays}
          mealTypes={mealTypes}
          meals={meals}
          recipes={recipes}
          onSlotClick={onSlotClick}
        />
      </Box>

      <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
        <DesktopWeekGrid
          weekDays={weekDays}
          mealTypes={mealTypes}
          meals={meals}
          recipes={recipes}
          onSlotClick={onSlotClick}
        />
      </Box>
    </>
  );
}
