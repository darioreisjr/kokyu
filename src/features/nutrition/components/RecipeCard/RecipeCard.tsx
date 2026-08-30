'use client';

import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { cardTokens } from '@/design-system/tokens/component';

import { getRecipeCategoryLabel } from '../../constants/recipeCategories';
import { nutritionRoutes } from '../../constants/nutritionRoutes';
import { getRecipeTotalTime, type Recipe } from '../../types/recipe.types';

export interface RecipeCardProps {
  recipe: Recipe;
}

/** No image required — a plain Kokyu-toned placeholder (an icon, not a hardcoded color swap) stands in when `imageUrl` is missing. */
export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Paper
      component={NextLink}
      href={nutritionRoutes.recipe(recipe.id)}
      elevation={0}
      sx={(theme) => ({
        display: 'block',
        borderRadius: cardTokens.radius,
        border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        backgroundColor: themePalette(theme).kokyu.surface.primary,
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color 120ms ease',
        '&:hover': { borderColor: themePalette(theme).kokyu.border.strong },
        '&:focus-visible': {
          outline: `2px solid ${themePalette(theme).kokyu.border.focus}`,
          outlineOffset: '2px',
        },
      })}
    >
      <Box
        sx={(theme) => ({
          aspectRatio: '4 / 3',
          backgroundColor: themePalette(theme).kokyu.background.subtle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: recipe.imageUrl ? `url(${recipe.imageUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        })}
      >
        {!recipe.imageUrl ? (
          <RestaurantRoundedIcon
            aria-hidden="true"
            sx={(theme) => ({ fontSize: 40, color: themePalette(theme).kokyu.text.disabled })}
          />
        ) : null}
      </Box>
      <Stack spacing={0.75} sx={{ padding: 2 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
        >
          <Typography variant="labelLarge" component="p" sx={{ flex: 1 }}>
            {recipe.name}
          </Typography>
          {recipe.favorite ? (
            <StarRoundedIcon
              aria-label="Favorita"
              fontSize="small"
              sx={(theme) => ({ color: themePalette(theme).kokyu.feedback.warning, flexShrink: 0 })}
            />
          ) : null}
        </Stack>
        <Typography
          variant="body2"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          {getRecipeCategoryLabel(recipe.category)} · {getRecipeTotalTime(recipe)} min ·{' '}
          {recipe.servings} porções
        </Typography>
        {recipe.tags.length > 0 ? (
          <Typography
            variant="labelSmall"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.disabled })}
          >
            {recipe.tags.join(' · ')}
          </Typography>
        ) : null}
      </Stack>
    </Paper>
  );
}
