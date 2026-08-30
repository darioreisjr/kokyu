'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

import { themePalette } from '@/design-system/theme/useThemePalette';

import { getEnabledMealTypes } from '../../constants/mealTypes';
import type { MealType, PlannedMeal } from '../../types/mealPlan.types';
import type { Recipe } from '../../types/recipe.types';
import { isToday, toDateKey } from '../../utils/dateHelpers';
import { PlannerMealChip } from './PlannerMealChip';

export interface DesktopWeekGridProps {
  weekDays: Date[];
  mealTypes: MealType[];
  meals: PlannedMeal[];
  recipes: Recipe[];
  onSlotClick: (date: Date, mealType: MealType, meal?: PlannedMeal) => void;
}

/** Columns = days, rows = enabled meal types — only shown from `sm` up, where seven columns still fit comfortably. */
export function DesktopWeekGrid({
  weekDays,
  mealTypes,
  meals,
  recipes,
  onSlotClick,
}: DesktopWeekGridProps) {
  const enabledMealTypes = getEnabledMealTypes(mealTypes);
  const recipeById = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const mealByKey = new Map(meals.map((meal) => [`${meal.date}::${meal.mealTypeId}`, meal]));

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `140px repeat(${weekDays.length}, minmax(120px, 1fr))`,
          gap: 1,
          minWidth: 760,
        }}
      >
        <Box />
        {weekDays.map((day) => (
          <Box key={toDateKey(day)} sx={{ textAlign: 'center', paddingBlock: 1 }}>
            <Typography
              variant="labelMedium"
              sx={(theme) => ({
                color: isToday(day)
                  ? themePalette(theme).kokyu.action.primary
                  : themePalette(theme).kokyu.text.secondary,
              })}
            >
              {format(day, 'EEE', { locale: ptBR })}
            </Typography>
            <Typography variant="labelLarge">{format(day, 'd')}</Typography>
          </Box>
        ))}

        {enabledMealTypes.map((mealType) => (
          <Box key={mealType.id} sx={{ display: 'contents' }}>
            <Typography
              variant="labelMedium"
              sx={(theme) => ({
                color: themePalette(theme).kokyu.text.secondary,
                display: 'flex',
                alignItems: 'center',
                paddingBlock: 1,
              })}
            >
              {mealType.name}
            </Typography>
            {weekDays.map((day) => {
              const meal = mealByKey.get(`${toDateKey(day)}::${mealType.id}`);
              return (
                <Box key={`${toDateKey(day)}-${mealType.id}`}>
                  <PlannerMealChip
                    meal={meal}
                    recipe={meal?.recipeId ? recipeById.get(meal.recipeId) : undefined}
                    onClick={() => onSlotClick(day, mealType, meal)}
                  />
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
