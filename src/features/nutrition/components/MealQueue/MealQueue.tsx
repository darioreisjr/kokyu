'use client';

import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { cardTokens } from '@/design-system/tokens/component';

import type { MealQueueEntry } from '../../types/mealPlan.types';
import type { Recipe } from '../../types/recipe.types';

export interface MealQueueProps {
  queue: MealQueueEntry[];
  recipes: Recipe[];
  onAssign: (entry: MealQueueEntry) => void;
  onRemove: (entry: MealQueueEntry) => void;
}

/** "Fila" — receitas que o usuário quer fazer nesta semana, mas ainda sem dia definido. */
export function MealQueue({ queue, recipes, onAssign, onRemove }: MealQueueProps) {
  if (queue.length === 0) return null;

  const recipeById = new Map(recipes.map((recipe) => [recipe.id, recipe]));

  return (
    <Paper
      component="section"
      aria-label="Fila de receitas"
      elevation={0}
      sx={(theme) => ({
        borderRadius: cardTokens.radius,
        border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        padding: 3,
      })}
    >
      <Stack spacing={2}>
        <Typography variant="labelLarge">Fila para esta semana</Typography>
        <Stack spacing={1.5}>
          {queue.map((entry) => {
            const recipe = recipeById.get(entry.recipeId);
            return (
              <Stack
                key={entry.id}
                direction="row"
                spacing={1.5}
                sx={{ alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1">{recipe?.name ?? 'Receita'}</Typography>
                <Stack direction="row" spacing={0.5}>
                  <KokyuButton variant="text" size="small" onClick={() => onAssign(entry)}>
                    Atribuir a um dia
                  </KokyuButton>
                  <IconButton
                    aria-label="Remover da fila"
                    size="small"
                    onClick={() => onRemove(entry)}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Paper>
  );
}
