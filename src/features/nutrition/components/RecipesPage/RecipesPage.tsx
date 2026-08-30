'use client';

import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useMemo, useState } from 'react';

import { EmptyState, KokyuButton, KokyuTextField } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { nutritionRoutes } from '../../constants/nutritionRoutes';
import { recipeCategoryDefinitions } from '../../constants/recipeCategories';
import { useRecipes } from '../../hooks/useRecipes';
import type { Recipe } from '../../types/recipe.types';
import { normalizeText } from '../../utils/normalizeText';
import { rankRecipesByAvailability } from '../../utils/whatCanIMake';
import { RecipeCard } from '../RecipeCard/RecipeCard';

type FilterValue =
  'todas' | 'favoritas' | 'recentes' | (typeof recipeCategoryDefinitions)[number]['id'];

const filterOptions: { id: FilterValue; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'favoritas', label: 'Favoritas' },
  { id: 'recentes', label: 'Recentes' },
  ...recipeCategoryDefinitions.map((category) => ({ id: category.id, label: category.label })),
];

function RecipeGrid({ recipes }: { recipes: Recipe[] }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 3,
      }}
    >
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </Box>
  );
}

/** `/app/nutricao/receitas` — the personal recipe library, plus "O que posso preparar?" comparing every recipe against the live pantry. */
export function RecipesPage() {
  const { status, recipes, pantryItems } = useRecipes();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterValue>('todas');
  const [showWhatCanIMake, setShowWhatCanIMake] = useState(false);

  const filteredRecipes = useMemo(() => {
    const normalizedQuery = normalizeText(search);
    let filtered = recipes.filter((recipe) => {
      if (normalizedQuery) {
        const matchesName = normalizeText(recipe.name).includes(normalizedQuery);
        const matchesTag = recipe.tags.some((tag) => normalizeText(tag).includes(normalizedQuery));
        if (!matchesName && !matchesTag) return false;
      }
      if (filter === 'favoritas') return recipe.favorite;
      if (filter !== 'todas' && filter !== 'recentes') return recipe.category === filter;
      return true;
    });

    if (filter === 'recentes') {
      filtered = [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    }
    return filtered;
  }, [recipes, search, filter]);

  const availability = useMemo(
    () => rankRecipesByAvailability(recipes, pantryItems),
    [recipes, pantryItems],
  );
  const recipeById = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const fullyAvailable = availability
    .filter((entry) => entry.canMakeFully)
    .map((entry) => recipeById.get(entry.recipeId)!);
  const partiallyAvailable = availability
    .filter((entry) => !entry.canMakeFully && entry.availableIngredients > 0)
    .map((entry) => recipeById.get(entry.recipeId)!);

  return (
    <Stack spacing={4}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' } }}
      >
        <Stack spacing={0.5}>
          <Typography variant="displaySmall" component="h1">
            Receitas
          </Typography>
          <Typography
            variant="body1"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Sua biblioteca pessoal de receitas.
          </Typography>
        </Stack>
        <KokyuButton
          variant="contained"
          component={NextLink}
          href={nutritionRoutes.newRecipe}
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          Nova receita
        </KokyuButton>
      </Stack>

      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <KokyuTextField
            label="Buscar receitas"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ flex: 1 }}
          />
          <KokyuButton
            variant={showWhatCanIMake ? 'contained' : 'outlined'}
            onClick={() => setShowWhatCanIMake((current) => !current)}
            sx={{ flexShrink: 0 }}
          >
            O que posso preparar?
          </KokyuButton>
        </Stack>
        {!showWhatCanIMake ? (
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(_event, next: FilterValue | null) => next && setFilter(next)}
            aria-label="Filtrar receitas"
            size="small"
            sx={{
              flexWrap: 'wrap',
              gap: 1,
              '& .MuiToggleButtonGroup-grouped': {
                border: '1px solid',
                borderRadius: '8px !important',
              },
            }}
          >
            {filterOptions.map((option) => (
              <ToggleButton key={option.id} value={option.id} sx={{ textTransform: 'none' }}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        ) : null}
      </Stack>

      {status === 'loading' ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 3,
          }}
        >
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={220} />
          ))}
        </Box>
      ) : null}
      {status === 'error' ? (
        <Alert severity="error">
          Não foi possível carregar suas receitas agora. Tente novamente.
        </Alert>
      ) : null}

      {status === 'ready' && recipes.length === 0 ? (
        <EmptyState
          icon={MenuBookRoundedIcon}
          title="Salve suas receitas para reutilizá-las durante a semana."
          action={
            <KokyuButton variant="contained" component={NextLink} href={nutritionRoutes.newRecipe}>
              Criar receita
            </KokyuButton>
          }
        />
      ) : null}

      {status === 'ready' && recipes.length > 0 && showWhatCanIMake ? (
        <Stack spacing={4}>
          <Stack spacing={1.5}>
            <Typography variant="labelLarge">Tenho tudo</Typography>
            {fullyAvailable.length > 0 ? (
              <RecipeGrid recipes={fullyAvailable} />
            ) : (
              <Typography
                variant="body2"
                sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
              >
                Nenhuma receita com todos os ingredientes disponíveis agora.
              </Typography>
            )}
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="labelLarge">Falta pouco</Typography>
            {partiallyAvailable.length > 0 ? (
              <RecipeGrid recipes={partiallyAvailable} />
            ) : (
              <Typography
                variant="body2"
                sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
              >
                Nenhuma receita parcialmente disponível.
              </Typography>
            )}
          </Stack>
        </Stack>
      ) : null}

      {status === 'ready' && recipes.length > 0 && !showWhatCanIMake ? (
        filteredRecipes.length > 0 ? (
          <RecipeGrid recipes={filteredRecipes} />
        ) : (
          <Typography
            variant="body2"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Nenhuma receita encontrada.
          </Typography>
        )
      ) : null}
    </Stack>
  );
}
