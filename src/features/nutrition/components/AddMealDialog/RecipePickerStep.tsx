'use client';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';

import { KokyuButton, KokyuTextField } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { getRecipeCategoryLabel } from '../../constants/recipeCategories';
import { getRecipeTotalTime, type Recipe } from '../../types/recipe.types';
import { normalizeText } from '../../utils/normalizeText';

export interface RecipePickerStepProps {
  recipes: Recipe[];
  defaultServings?: number;
  onCancel: () => void;
  onConfirm: (recipe: Recipe, servings: number, time: string) => void;
  defaultTime?: string;
}

/** Search → pick → confirm servings/time, all as one step so "Adicionar receita" never bounces through a separate dialog. */
export function RecipePickerStep({
  recipes,
  defaultServings,
  onCancel,
  onConfirm,
  defaultTime,
}: RecipePickerStepProps) {
  const [query, setQuery] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [servings, setServings] = useState(defaultServings ?? 1);
  const [time, setTime] = useState(defaultTime ?? '');

  const filteredRecipes = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    return recipes.filter((recipe) => {
      if (favoritesOnly && !recipe.favorite) return false;
      if (!normalizedQuery) return true;
      return normalizeText(recipe.name).includes(normalizedQuery);
    });
  }, [recipes, query, favoritesOnly]);

  if (selectedRecipe) {
    return (
      <Stack spacing={2.5}>
        <Typography variant="labelLarge">{selectedRecipe.name}</Typography>
        <Stack direction="row" spacing={2}>
          <KokyuTextField
            label="Porções"
            type="number"
            value={servings}
            onChange={(event) => setServings(Number(event.target.value) || 1)}
            slotProps={{ htmlInput: { min: 1 } }}
          />
          <KokyuTextField
            label="Horário (opcional)"
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
          <KokyuButton variant="text" onClick={() => setSelectedRecipe(null)}>
            Voltar
          </KokyuButton>
          <KokyuButton
            variant="contained"
            onClick={() => onConfirm(selectedRecipe, servings, time)}
          >
            Adicionar
          </KokyuButton>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <KokyuTextField
        label="Buscar receitas"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <KokyuButton
        variant={favoritesOnly ? 'contained' : 'outlined'}
        size="small"
        startIcon={<StarRoundedIcon />}
        onClick={() => setFavoritesOnly((current) => !current)}
        sx={{ alignSelf: 'flex-start' }}
      >
        Favoritas
      </KokyuButton>

      {filteredRecipes.length === 0 ? (
        <Typography
          variant="body2"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          Nenhuma receita encontrada.
        </Typography>
      ) : (
        <List sx={{ maxHeight: 320, overflowY: 'auto' }}>
          {filteredRecipes.map((recipe) => (
            <ListItemButton
              key={recipe.id}
              onClick={() => setSelectedRecipe(recipe)}
              sx={{ borderRadius: 1 }}
            >
              <ListItemText
                primary={recipe.name}
                secondary={`${getRecipeCategoryLabel(recipe.category)} · ${getRecipeTotalTime(recipe)} min · ${recipe.servings} porções`}
              />
            </ListItemButton>
          ))}
        </List>
      )}

      <KokyuButton variant="text" onClick={onCancel} sx={{ alignSelf: 'flex-start' }}>
        Voltar
      </KokyuButton>
    </Stack>
  );
}
