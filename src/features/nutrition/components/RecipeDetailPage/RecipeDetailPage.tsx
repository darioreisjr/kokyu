'use client';

import EditRoundedIcon from '@mui/icons-material/EditRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { KokyuButton } from '@/design-system/components';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { getRecipeCategoryLabel } from '../../constants/recipeCategories';
import { getUnitAbbreviation } from '../../constants/units';
import { mealPlanService } from '../../services/mealPlanService';
import { ingredientService } from '../../services/ingredientService';
import { pantryService } from '../../services/pantryService';
import { recipeService } from '../../services/recipeService';
import { getShoppingNeedsForRecipe } from '../../services/shoppingNeedsService';
import { shoppingService } from '../../services/shoppingService';
import type { Ingredient } from '../../types/ingredient.types';
import type { MealType } from '../../types/mealPlan.types';
import type { PantryItem } from '../../types/pantry.types';
import { getRecipeTotalTime, type Recipe } from '../../types/recipe.types';
import { nutritionRoutes } from '../../constants/nutritionRoutes';
import { calculateRecipeAvailability } from '../../utils/whatCanIMake';
import { AddToPlanDialog } from '../AddToPlanDialog/AddToPlanDialog';

export interface RecipeDetailPageProps {
  recipeId: string;
}

const servingsMultipliers = [1, 2, 3];

/** `/app/nutricao/receitas/[id]` — the first dynamic route in the app. Scaling only ever affects this preview, never the stored recipe. */
export function RecipeDetailPage({ recipeId }: RecipeDetailPageProps) {
  const { showSuccess, showError } = useSnackbar();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'not-found'>('loading');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [scaleMultiplier, setScaleMultiplier] = useState(1);
  const [addToPlanOpen, setAddToPlanOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    Promise.all([
      recipeService.getRecipe(recipeId),
      ingredientService.getIngredients(),
      pantryService.getPantry(),
      mealPlanService.getMealTypes(),
    ])
      .then(([loadedRecipe, loadedIngredients, loadedPantryItems, loadedMealTypes]) => {
        if (cancelled) return;
        if (!loadedRecipe) {
          setStatus('not-found');
          return;
        }
        setRecipe(loadedRecipe);
        setIngredients(loadedIngredients);
        setPantryItems(loadedPantryItems);
        setMealTypes(loadedMealTypes);
        setScaleMultiplier(1);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [recipeId]);

  const ingredientById = useMemo(
    () => new Map(ingredients.map((ingredient) => [ingredient.id, ingredient])),
    [ingredients],
  );
  const availability = useMemo(
    () => (recipe ? calculateRecipeAvailability(recipe, pantryItems) : null),
    [recipe, pantryItems],
  );
  const missingIds = useMemo(
    () => new Set(availability?.missingIngredientIds ?? []),
    [availability],
  );

  async function reloadRecipe() {
    const updated = await recipeService.getRecipe(recipeId);
    setRecipe(updated);
  }

  async function handleToggleFavorite() {
    await recipeService.toggleFavorite(recipeId);
    reloadRecipe();
  }

  async function handleAddMissingToShopping() {
    if (!recipe) return;
    const summary = await getShoppingNeedsForRecipe(recipeId, recipe.servings * scaleMultiplier);
    const added = await shoppingService.addShoppingItemsFromNeeds(summary, 'recipe');
    if (added.length === 0) {
      showError('Você já tem todos os ingredientes desta receita.');
    } else {
      showSuccess('Ingredientes faltantes adicionados às compras.');
    }
  }

  if (status === 'loading') {
    return (
      <Stack spacing={3}>
        <Skeleton variant="rounded" height={240} />
        <Skeleton variant="text" width={280} height={40} />
        <Skeleton variant="text" width={200} />
      </Stack>
    );
  }

  if (status === 'not-found') {
    return <Alert severity="error">Receita não encontrada.</Alert>;
  }

  if (status === 'error' || !recipe) {
    return (
      <Alert severity="error">Não foi possível carregar esta receita agora. Tente novamente.</Alert>
    );
  }

  const scaledServings = recipe.servings * scaleMultiplier;

  return (
    <Stack spacing={4}>
      <Box
        sx={(theme) => ({
          aspectRatio: '16 / 7',
          borderRadius: 2,
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
            sx={(theme) => ({ fontSize: 56, color: themePalette(theme).kokyu.text.disabled })}
          />
        ) : null}
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-start' } }}
      >
        <Stack spacing={0.5} sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="displaySmall" component="h1">
              {recipe.name}
            </Typography>
            <IconButton
              aria-label={recipe.favorite ? 'Remover dos favoritos' : 'Favoritar'}
              onClick={handleToggleFavorite}
            >
              {recipe.favorite ? (
                <StarRoundedIcon
                  sx={(theme) => ({ color: themePalette(theme).kokyu.feedback.warning })}
                />
              ) : (
                <StarOutlineRoundedIcon />
              )}
            </IconButton>
          </Stack>
          {recipe.description ? (
            <Typography
              variant="body1"
              sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
            >
              {recipe.description}
            </Typography>
          ) : null}
          <Typography
            variant="body2"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            {getRecipeCategoryLabel(recipe.category)} · Preparo {recipe.preparationTime} min ·
            Cozimento {recipe.cookingTime} min · Total {getRecipeTotalTime(recipe)} min
          </Typography>
        </Stack>

        <Stack direction={{ xs: 'row', sm: 'column' }} spacing={1} sx={{ flexWrap: 'wrap' }}>
          <KokyuButton variant="contained" onClick={() => setAddToPlanOpen(true)}>
            Adicionar ao planejamento
          </KokyuButton>
          <KokyuButton
            variant="outlined"
            component={NextLink}
            href={`${nutritionRoutes.recipe(recipe.id)}/editar`}
            startIcon={<EditRoundedIcon />}
          >
            Editar
          </KokyuButton>
        </Stack>
      </Stack>

      {availability ? (
        <Alert severity={availability.canMakeFully ? 'success' : 'info'}>
          {availability.availableIngredients} de {availability.totalIngredients} ingredientes
          disponíveis na despensa.
          {!availability.canMakeFully ? (
            <>
              {' '}
              <KokyuButton
                variant="text"
                size="small"
                onClick={handleAddMissingToShopping}
                sx={{ padding: 0, minHeight: 'auto', verticalAlign: 'baseline' }}
              >
                Adicionar faltantes às compras
              </KokyuButton>
            </>
          ) : null}
        </Alert>
      ) : null}

      <Stack spacing={1.5}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Typography variant="labelLarge">Ingredientes</Typography>
          <ToggleButtonGroup
            value={scaleMultiplier}
            exclusive
            onChange={(_event, next: number | null) => next && setScaleMultiplier(next)}
            size="small"
            aria-label="Ajustar porções"
          >
            {servingsMultipliers.map((multiplier) => (
              <ToggleButton key={multiplier} value={multiplier} sx={{ textTransform: 'none' }}>
                {multiplier}x
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Typography
            variant="body2"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            {scaledServings} porções
          </Typography>
        </Stack>
        <Stack component="ul" spacing={1} sx={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {recipe.ingredients.map((recipeIngredient, index) => {
            const ingredient = ingredientById.get(recipeIngredient.ingredientId);
            const missing = missingIds.has(recipeIngredient.ingredientId);
            return (
              <Typography
                component="li"
                key={`${recipeIngredient.ingredientId}-${index}`}
                variant="body1"
              >
                {(recipeIngredient.quantity * scaleMultiplier).toLocaleString('pt-BR')}{' '}
                {getUnitAbbreviation(recipeIngredient.unit)}{' '}
                {ingredient?.name ?? recipeIngredient.ingredientId}
                {recipeIngredient.preparationNote ? `, ${recipeIngredient.preparationNote}` : ''}
                {missing ? (
                  <Typography
                    component="span"
                    variant="labelSmall"
                    sx={(theme) => ({
                      color: themePalette(theme).kokyu.feedback.warning,
                      marginLeft: 1,
                    })}
                  >
                    faltando
                  </Typography>
                ) : null}
              </Typography>
            );
          })}
        </Stack>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="labelLarge">Modo de preparo</Typography>
        <Stack component="ol" spacing={1.5} sx={{ margin: 0, paddingInlineStart: 3 }}>
          {[...recipe.steps]
            .sort((a, b) => a.order - b.order)
            .map((step) => (
              <Typography component="li" key={step.id} variant="body1">
                {step.text}
              </Typography>
            ))}
        </Stack>
      </Stack>

      {recipe.notes ? (
        <Stack spacing={1}>
          <Typography variant="labelLarge">Notas</Typography>
          <Typography
            variant="body1"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            {recipe.notes}
          </Typography>
        </Stack>
      ) : null}

      <AddToPlanDialog
        open={addToPlanOpen}
        target={{ recipeName: recipe.name, defaultServings: recipe.servings }}
        mealTypes={mealTypes}
        onClose={() => setAddToPlanOpen(false)}
        onConfirm={(date, mealTypeId, servings) => {
          mealPlanService
            .addPlannedMeal({
              date,
              mealTypeId,
              contentType: 'recipe',
              recipeId: recipe.id,
              servings,
            })
            .then(() => {
              showSuccess('Receita adicionada ao planejamento.');
              setAddToPlanOpen(false);
            });
        }}
      />
    </Stack>
  );
}
