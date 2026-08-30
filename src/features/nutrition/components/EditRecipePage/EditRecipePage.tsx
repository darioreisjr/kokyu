'use client';

import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { nutritionRoutes } from '../../constants/nutritionRoutes';
import { ingredientService } from '../../services/ingredientService';
import { recipeService } from '../../services/recipeService';
import type { Ingredient } from '../../types/ingredient.types';
import type { Recipe, RecipeIngredient } from '../../types/recipe.types';
import type { RecipeFormValues } from '../../schemas/recipeSchema';
import { RecipeForm } from '../RecipeForm/RecipeForm';

export interface EditRecipePageProps {
  recipeId: string;
}

function toFormValues(recipe: Recipe, ingredientsById: Map<string, Ingredient>): RecipeFormValues {
  return {
    name: recipe.name,
    description: recipe.description ?? '',
    category: recipe.category,
    tags: recipe.tags,
    preparationTime: recipe.preparationTime,
    cookingTime: recipe.cookingTime,
    servings: recipe.servings,
    ingredients: recipe.ingredients.map((ingredient) => ({
      ingredientName: ingredientsById.get(ingredient.ingredientId)?.name ?? '',
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      preparationNote: ingredient.preparationNote ?? '',
    })),
    steps: [...recipe.steps].sort((a, b) => a.order - b.order).map((step) => ({ text: step.text })),
    notes: recipe.notes ?? '',
  };
}

export function EditRecipePage({ recipeId }: EditRecipePageProps) {
  const router = useRouter();
  const { showSuccess } = useSnackbar();
  const [status, setStatus] = useState<'loading' | 'ready' | 'not-found' | 'error'>('loading');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    Promise.all([recipeService.getRecipe(recipeId), ingredientService.getIngredients()])
      .then(([loadedRecipe, loadedIngredients]) => {
        if (cancelled) return;
        if (!loadedRecipe) {
          setStatus('not-found');
          return;
        }
        setRecipe(loadedRecipe);
        setIngredients(loadedIngredients);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [recipeId]);

  async function handleSubmit(values: RecipeFormValues) {
    setIsSubmitting(true);
    try {
      const resolvedIngredients: RecipeIngredient[] = [];
      for (const ingredient of values.ingredients) {
        const resolved = await ingredientService.findOrCreateByName(
          ingredient.ingredientName,
          'outros',
          ingredient.unit,
        );
        resolvedIngredients.push({
          ingredientId: resolved.id,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          preparationNote: ingredient.preparationNote || undefined,
        });
      }

      await recipeService.updateRecipe(recipeId, {
        name: values.name,
        description: values.description || undefined,
        category: values.category,
        tags: values.tags,
        preparationTime: values.preparationTime,
        cookingTime: values.cookingTime,
        servings: values.servings,
        ingredients: resolvedIngredients,
        steps: values.steps,
        notes: values.notes || undefined,
      });

      showSuccess('Receita atualizada.');
      router.push(nutritionRoutes.recipe(recipeId));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === 'loading') {
    return (
      <Stack spacing={3}>
        <Skeleton variant="text" width={240} height={40} />
        <Skeleton variant="rounded" height={400} />
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

  const ingredientsById = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]));

  return (
    <Stack spacing={4}>
      <Stack spacing={0.5}>
        <Typography variant="displaySmall" component="h1">
          Editar receita
        </Typography>
        <Typography
          variant="body1"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          {recipe.name}
        </Typography>
      </Stack>
      <RecipeForm
        ingredients={ingredients}
        defaultValues={toFormValues(recipe, ingredientsById)}
        submitLabel="Salvar alterações"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </Stack>
  );
}
