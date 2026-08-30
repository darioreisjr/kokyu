'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { themePalette } from '@/design-system/theme/useThemePalette';

import type { PlannedMeal } from '../../types/mealPlan.types';
import type { Recipe } from '../../types/recipe.types';

export interface PlannerMealChipProps {
  meal?: PlannedMeal;
  recipe?: Recipe;
  onClick: () => void;
}

/** A compact cell for the desktop grid / tablet day cards — full detail lives in `MealCard`, this is just enough to recognize what's planned and open it. */
export function PlannerMealChip({ meal, recipe, onClick }: PlannerMealChipProps) {
  const label = !meal
    ? null
    : meal.contentType === 'recipe'
      ? (recipe?.name ?? 'Receita')
      : meal.contentType === 'note'
        ? meal.note
        : 'Alimento';

  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={(theme) => ({
        width: '100%',
        textAlign: 'left',
        border: `1px dashed ${themePalette(theme).kokyu.border.subtle}`,
        borderStyle: meal ? 'solid' : 'dashed',
        borderRadius: 1,
        backgroundColor: meal ? themePalette(theme).kokyu.surface.secondary : 'transparent',
        padding: '6px 8px',
        cursor: 'pointer',
        font: 'inherit',
        color: 'inherit',
        '&:focus-visible': {
          outline: `2px solid ${themePalette(theme).kokyu.border.focus}`,
          outlineOffset: '2px',
        },
      })}
    >
      <Typography
        variant="body2"
        noWrap
        sx={(theme) => ({
          color: meal
            ? themePalette(theme).kokyu.text.primary
            : themePalette(theme).kokyu.text.disabled,
        })}
      >
        {label ?? '+ Adicionar'}
      </Typography>
    </Box>
  );
}
