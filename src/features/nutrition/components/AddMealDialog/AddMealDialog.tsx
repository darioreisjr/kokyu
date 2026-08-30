'use client';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useEffect, useState } from 'react';

import { KokyuButton } from '@/design-system/components';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';

import { ingredientService } from '../../services/ingredientService';
import { mealPlanService } from '../../services/mealPlanService';
import type { Ingredient } from '../../types/ingredient.types';
import type { MealType, PlannedMealFoodItem } from '../../types/mealPlan.types';
import type { Recipe } from '../../types/recipe.types';
import { FoodFormStep, type FoodFormItemValue } from './FoodFormStep';
import { NoteFormStep } from './NoteFormStep';
import { RecipePickerStep } from './RecipePickerStep';

type Step = 'choose' | 'recipe' | 'food' | 'note';

export interface AddMealDialogProps {
  open: boolean;
  date: string;
  mealType: MealType;
  recipes: Recipe[];
  ingredients: Ingredient[];
  onClose: () => void;
  onSaved: () => void;
}

/**
 * "Adicionar refeição" — one dialog, four ways in (receita/alimento/
 * anotação/repetir), so the meal-picking flow doesn't bounce the user
 * through a stack of separate dialogs. Full-screen below `sm`, per
 * the spec's "formulários complexos usam full-screen Dialog no
 * mobile."
 */
export function AddMealDialog({
  open,
  date,
  mealType,
  recipes,
  ingredients,
  onClose,
  onSaved,
}: AddMealDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showSuccess, showError } = useSnackbar();
  const [step, setStep] = useState<Step>('choose');
  const [isRepeating, setIsRepeating] = useState(false);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => setStep('choose'));
  }, [open]);

  function handleSaved() {
    showSuccess('Refeição adicionada ao planejamento.');
    onSaved();
    onClose();
  }

  async function handleRecipeConfirm(recipe: Recipe, servings: number, time: string) {
    await mealPlanService.addPlannedMeal({
      date,
      mealTypeId: mealType.id,
      contentType: 'recipe',
      recipeId: recipe.id,
      servings,
      time: time || undefined,
    });
    handleSaved();
  }

  async function handleFoodConfirm(items: FoodFormItemValue[]) {
    const foodItems: PlannedMealFoodItem[] = [];
    for (const item of items) {
      const ingredient =
        item.existingIngredient ??
        (await ingredientService.findOrCreateByName(item.ingredientName, 'outros', item.unit));
      foodItems.push({ ingredientId: ingredient.id, quantity: item.quantity, unit: item.unit });
    }
    await mealPlanService.addPlannedMeal({
      date,
      mealTypeId: mealType.id,
      contentType: 'food',
      foodItems,
    });
    handleSaved();
  }

  async function handleNoteConfirm(note: string) {
    await mealPlanService.addPlannedMeal({
      date,
      mealTypeId: mealType.id,
      contentType: 'note',
      note,
    });
    handleSaved();
  }

  async function handleRepeat() {
    setIsRepeating(true);
    const previous = await mealPlanService.getMostRecentMealOfType(mealType.id, date);
    if (!previous) {
      showError('Nenhuma refeição anterior encontrada para repetir.');
      setIsRepeating(false);
      return;
    }
    await mealPlanService.addPlannedMeal({
      date,
      mealTypeId: mealType.id,
      contentType: previous.contentType,
      recipeId: previous.recipeId,
      servings: previous.servings,
      foodItems: previous.foodItems,
      note: previous.note,
      time: previous.time,
      useLeftovers: previous.useLeftovers,
    });
    setIsRepeating(false);
    handleSaved();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth="sm"
      aria-labelledby="add-meal-title"
    >
      <DialogTitle id="add-meal-title">Adicionar refeição — {mealType.name}</DialogTitle>
      <DialogContent>
        {step === 'choose' ? (
          <Stack spacing={1.5}>
            <KokyuButton
              variant="outlined"
              onClick={() => setStep('recipe')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Adicionar receita
            </KokyuButton>
            <KokyuButton
              variant="outlined"
              onClick={() => setStep('food')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Adicionar alimento
            </KokyuButton>
            <KokyuButton
              variant="outlined"
              onClick={() => setStep('note')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Adicionar anotação
            </KokyuButton>
            <KokyuButton
              variant="outlined"
              onClick={handleRepeat}
              loading={isRepeating}
              sx={{ justifyContent: 'flex-start' }}
            >
              Repetir refeição anterior
            </KokyuButton>
          </Stack>
        ) : null}

        {step === 'recipe' ? (
          <RecipePickerStep
            recipes={recipes}
            defaultTime={mealType.defaultTime}
            onCancel={() => setStep('choose')}
            onConfirm={handleRecipeConfirm}
          />
        ) : null}

        {step === 'food' ? (
          <FoodFormStep
            ingredients={ingredients}
            onCancel={() => setStep('choose')}
            onConfirm={handleFoodConfirm}
          />
        ) : null}

        {step === 'note' ? (
          <NoteFormStep onCancel={() => setStep('choose')} onConfirm={handleNoteConfirm} />
        ) : null}
      </DialogContent>
      {step === 'choose' ? (
        <DialogActions>
          <KokyuButton variant="text" onClick={onClose}>
            Cancelar
          </KokyuButton>
        </DialogActions>
      ) : null}
    </Dialog>
  );
}
