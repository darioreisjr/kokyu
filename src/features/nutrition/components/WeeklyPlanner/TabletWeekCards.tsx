'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { cardTokens } from '@/design-system/tokens/component';

import { getEnabledMealTypes } from '../../constants/mealTypes';
import type { MealType, PlannedMeal } from '../../types/mealPlan.types';
import type { Recipe } from '../../types/recipe.types';
import { isToday, toDateKey } from '../../utils/dateHelpers';
import { PlannerMealChip } from './PlannerMealChip';

export interface TabletWeekCardsProps {
  weekDays: Date[];
  mealTypes: MealType[];
  meals: PlannedMeal[];
  recipes: Recipe[];
  onSlotClick: (date: Date, mealType: MealType, meal?: PlannedMeal) => void;
}

/** One card per day, in a grid that wraps to 2–3 columns instead of forcing all seven side by side — for the tablet width the desktop grid gets cramped at. */
export function TabletWeekCards({
  weekDays,
  mealTypes,
  meals,
  recipes,
  onSlotClick,
}: TabletWeekCardsProps) {
  const enabledMealTypes = getEnabledMealTypes(mealTypes);
  const recipeById = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const mealByKey = new Map(meals.map((meal) => [`${meal.date}::${meal.mealTypeId}`, meal]));

  return (
    <Box
      sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 2 }}
    >
      {weekDays.map((day) => (
        <Paper
          key={toDateKey(day)}
          elevation={0}
          sx={(theme) => ({
            borderRadius: cardTokens.radius,
            border: `1px solid ${isToday(day) ? themePalette(theme).kokyu.border.focus : themePalette(theme).kokyu.border.subtle}`,
            padding: 2,
          })}
        >
          <Stack spacing={1.5}>
            <Typography variant="labelLarge">
              {format(day, 'EEEE', { locale: ptBR })}, {format(day, 'd')}
            </Typography>
            <Stack spacing={1}>
              {enabledMealTypes.map((mealType) => {
                const meal = mealByKey.get(`${toDateKey(day)}::${mealType.id}`);
                return (
                  <Stack key={mealType.id} spacing={0.25}>
                    <Typography
                      variant="labelSmall"
                      sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                    >
                      {mealType.name}
                    </Typography>
                    <PlannerMealChip
                      meal={meal}
                      recipe={meal?.recipeId ? recipeById.get(meal.recipeId) : undefined}
                      onClick={() => onSlotClick(day, mealType, meal)}
                    />
                  </Stack>
                );
              })}
            </Stack>
          </Stack>
        </Paper>
      ))}
    </Box>
  );
}
