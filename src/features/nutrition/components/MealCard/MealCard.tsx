'use client';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { cardTokens } from '@/design-system/tokens/component';

import type { Ingredient } from '../../types/ingredient.types';
import type { MealType, PlannedMeal } from '../../types/mealPlan.types';
import type { Recipe } from '../../types/recipe.types';
import { getUnitAbbreviation } from '../../constants/units';

export interface MealCardProps {
  mealType: MealType;
  meal?: PlannedMeal;
  recipe?: Recipe;
  ingredientsById?: Map<string, Ingredient>;
  onAddMeal: () => void;
  onRemoveMeal?: (meal: PlannedMeal) => void;
  onTogglePrepared?: (meal: PlannedMeal) => void;
  onMoveMeal?: (meal: PlannedMeal) => void;
}

function MealContent({
  meal,
  recipe,
  ingredientsById,
}: {
  meal: PlannedMeal;
  recipe?: Recipe;
  ingredientsById?: Map<string, Ingredient>;
}) {
  if (meal.contentType === 'recipe') {
    return (
      <Stack spacing={0.25}>
        <Typography variant="labelLarge" component="p">
          {recipe?.name ?? 'Receita'}
        </Typography>
        {meal.servings ? (
          <Typography
            variant="body2"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            {meal.servings} {meal.servings === 1 ? 'porção' : 'porções'}
          </Typography>
        ) : null}
      </Stack>
    );
  }

  if (meal.contentType === 'food' && meal.foodItems) {
    return (
      <Stack spacing={0.25}>
        {meal.foodItems.map((item, index) => {
          const ingredient = ingredientsById?.get(item.ingredientId);
          return (
            <Typography key={`${item.ingredientId}-${index}`} variant="labelLarge" component="p">
              {ingredient?.name ?? item.ingredientId} — {item.quantity}{' '}
              {getUnitAbbreviation(item.unit)}
            </Typography>
          );
        })}
      </Stack>
    );
  }

  return (
    <Typography variant="labelLarge" component="p">
      {meal.note}
    </Typography>
  );
}

/**
 * One meal slot for the day — the empty state ("Nenhuma refeição
 * planejada" + CTA) and the planned state (recipe/food/note content +
 * actions) both live here so `DailyMeals` never branches on this
 * itself.
 */
export function MealCard({
  mealType,
  meal,
  recipe,
  ingredientsById,
  onAddMeal,
  onRemoveMeal,
  onTogglePrepared,
  onMoveMeal,
}: MealCardProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const time = meal?.time ?? mealType.defaultTime;

  return (
    <Paper
      component="section"
      aria-label={mealType.name}
      elevation={0}
      sx={(theme) => ({
        borderRadius: cardTokens.radius,
        border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        backgroundColor: themePalette(theme).kokyu.surface.primary,
        padding: 3,
      })}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'flex-start', flex: 1, minWidth: 0 }}
        >
          {meal ? (
            <IconButton
              aria-label={meal.prepared ? 'Marcar como não preparada' : 'Marcar como preparada'}
              aria-pressed={meal.prepared}
              size="small"
              onClick={() => onTogglePrepared?.(meal)}
              sx={{ marginTop: '-4px' }}
            >
              {meal.prepared ? (
                <CheckCircleRoundedIcon
                  fontSize="small"
                  sx={(theme) => ({ color: themePalette(theme).kokyu.feedback.success })}
                />
              ) : (
                <RadioButtonUncheckedRoundedIcon
                  fontSize="small"
                  sx={(theme) => ({ color: themePalette(theme).kokyu.text.disabled })}
                />
              )}
            </IconButton>
          ) : (
            <RestaurantMenuRoundedIcon
              aria-hidden="true"
              fontSize="small"
              sx={(theme) => ({
                color: themePalette(theme).kokyu.text.secondary,
                marginTop: '6px',
              })}
            />
          )}

          <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
              <Typography
                variant="labelMedium"
                sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
              >
                {mealType.name}
              </Typography>
              {time ? (
                <Typography
                  variant="labelSmall"
                  sx={(theme) => ({ color: themePalette(theme).kokyu.text.disabled })}
                >
                  {time}
                </Typography>
              ) : null}
              {meal?.useLeftovers ? (
                <Typography
                  variant="labelSmall"
                  sx={(theme) => ({ color: themePalette(theme).kokyu.feedback.info })}
                >
                  Sobras
                </Typography>
              ) : null}
            </Stack>

            {meal ? (
              <MealContent meal={meal} recipe={recipe} ingredientsById={ingredientsById} />
            ) : (
              <Typography
                variant="body2"
                sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
              >
                Nenhuma refeição planejada
              </Typography>
            )}
          </Stack>
        </Stack>

        <Box sx={{ flexShrink: 0, alignSelf: { xs: 'flex-end', sm: 'center' } }}>
          {meal ? (
            <>
              <IconButton
                aria-label="Mais ações"
                onClick={(event) => setMenuAnchor(event.currentTarget)}
              >
                <MoreVertRoundedIcon fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
              >
                <MenuItem
                  onClick={() => {
                    setMenuAnchor(null);
                    onMoveMeal?.(meal);
                  }}
                >
                  Mover para...
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setMenuAnchor(null);
                    onRemoveMeal?.(meal);
                  }}
                >
                  Remover
                </MenuItem>
              </Menu>
            </>
          ) : (
            <KokyuButton
              variant="text"
              size="small"
              startIcon={<AddRoundedIcon />}
              onClick={onAddMeal}
            >
              Adicionar refeição
            </KokyuButton>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}
