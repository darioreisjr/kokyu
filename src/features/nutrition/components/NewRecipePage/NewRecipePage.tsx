'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { nutritionRoutes } from '../../constants/nutritionRoutes';
import { ingredientService } from '../../services/ingredientService';
import { recipeService } from '../../services/recipeService';
import type { RecipeIngredient } from '../../types/recipe.types';
import type { Ingredient } from '../../types/ingredient.types';
import type { RecipeFormValues } from '../../schemas/recipeSchema';
import { RecipeForm } from '../RecipeForm/RecipeForm';

/** `/app/nutricao/receitas/nova` — resolves each typed ingredient name to a real `Ingredient` (existing or newly created) before saving, so the recipe never stores raw text where an id belongs. */
export function NewRecipePage() {
  const router = useRouter();
  const { showSuccess } = useSnackbar();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    ingredientService.getIngredients().then(setIngredients);
  }, []);

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

      const recipe = await recipeService.createRecipe({
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

      showSuccess('Receita salva.');
      router.push(nutritionRoutes.recipe(recipe.id));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Stack spacing={4}>
      <Stack spacing={0.5}>
        <Typography variant="displaySmall" component="h1">
          Nova receita
        </Typography>
        <Typography
          variant="body1"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          Cadastre uma receita para usar no planejamento.
        </Typography>
      </Stack>
      <RecipeForm
        ingredients={ingredients}
        submitLabel="Salvar receita"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </Stack>
  );
}
