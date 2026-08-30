'use client';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';

import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { getEnabledMealTypes } from '../../constants/mealTypes';
import { useConfirmAction } from '../../hooks/useConfirmAction';
import { useDailyMeals } from '../../hooks/useDailyMeals';
import { useShoppingNeeds } from '../../hooks/useShoppingNeeds';
import { mealPlanService } from '../../services/mealPlanService';
import type { MealType, PlannedMeal } from '../../types/mealPlan.types';
import { toDateKey } from '../../utils/dateHelpers';
import { AddMealDialog } from '../AddMealDialog/AddMealDialog';
import { ConfirmActionDialog } from '../ConfirmActionDialog/ConfirmActionDialog';
import { DailyMeals } from '../DailyMeals/DailyMeals';
import { DailySummary } from '../DailySummary/DailySummary';
import { DateSelector } from '../DateSelector/DateSelector';
import { MoveMealDialog } from '../MoveMealDialog/MoveMealDialog';
import { TodayPageSkeleton } from './TodayPageSkeleton';

/**
 * The Nutrição root route (`/app/nutricao`) — the day's meals, a
 * short contextual summary, and every entry point for adding/editing
 * a meal. Owns the confirm-before-remove flow via `useConfirmAction`
 * instead of a bespoke dialog.
 */
export function TodayPage() {
  const [date, setDate] = useState(() => new Date());
  const dateKey = toDateKey(date);
  const { status, mealTypes, meals, recipes, ingredients, reload } = useDailyMeals(date);
  const { showSuccess } = useSnackbar();
  const confirmAction = useConfirmAction();

  const [addMealTarget, setAddMealTarget] = useState<MealType | null>(null);
  const [moveMealTarget, setMoveMealTarget] = useState<PlannedMeal | null>(null);

  const shoppingNeeds = useShoppingNeeds(dateKey, dateKey, meals.length);

  const ingredientsById = useMemo(
    () => new Map(ingredients.map((ingredient) => [ingredient.id, ingredient])),
    [ingredients],
  );

  const enabledMealTypes = getEnabledMealTypes(mealTypes);
  const nextMeal = useMemo(() => {
    const now = new Date();
    const isToday = toDateKey(now) === dateKey;
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const sortedMealTypes = [...enabledMealTypes].sort((a, b) =>
      (a.defaultTime ?? '').localeCompare(b.defaultTime ?? ''),
    );
    const upcoming = sortedMealTypes.find((mealType) => {
      const meal = meals.find((candidate) => candidate.mealTypeId === mealType.id);
      const time = meal?.time ?? mealType.defaultTime;
      if (!time) return false;
      return !isToday || time >= currentTime;
    });
    if (!upcoming) return undefined;
    const meal = meals.find((candidate) => candidate.mealTypeId === upcoming.id);
    return { label: upcoming.name, time: meal?.time ?? upcoming.defaultTime };
  }, [enabledMealTypes, meals, dateKey]);

  function handleTogglePrepared(meal: PlannedMeal) {
    mealPlanService.updatePlannedMeal(meal.id, { prepared: !meal.prepared }).then(reload);
  }

  function handleRemoveMeal(meal: PlannedMeal) {
    confirmAction.request({
      title: 'Remover refeição?',
      description: 'Esta refeição será removida do seu planejamento.',
      confirmLabel: 'Remover',
      onConfirm: () => {
        mealPlanService.removePlannedMeal(meal.id).then(() => {
          showSuccess('Refeição removida.');
          reload();
        });
      },
    });
  }

  return (
    <Stack spacing={4}>
      <Stack spacing={0.5}>
        <Typography variant="displaySmall" component="h1">
          Nutrição
        </Typography>
        <Typography
          variant="body1"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          Organize suas refeições, receitas e tudo que precisa para a semana.
        </Typography>
      </Stack>

      <DateSelector date={date} onChange={setDate} />

      {status === 'loading' ? <TodayPageSkeleton /> : null}
      {status === 'error' ? (
        <Alert severity="error">
          Não foi possível carregar suas refeições agora. Tente novamente.
        </Alert>
      ) : null}

      {status === 'ready' ? (
        <>
          <DailySummary
            plannedCount={meals.length}
            totalSlots={enabledMealTypes.length}
            missingIngredientsCount={shoppingNeeds.needsPurchase}
            nextMeal={nextMeal}
          />
          <DailyMeals
            mealTypes={mealTypes}
            meals={meals}
            recipes={recipes}
            ingredientsById={ingredientsById}
            onAddMeal={setAddMealTarget}
            onRemoveMeal={handleRemoveMeal}
            onTogglePrepared={handleTogglePrepared}
            onMoveMeal={setMoveMealTarget}
          />
        </>
      ) : null}

      {addMealTarget ? (
        <AddMealDialog
          open={Boolean(addMealTarget)}
          date={dateKey}
          mealType={addMealTarget}
          recipes={recipes}
          ingredients={ingredients}
          onClose={() => setAddMealTarget(null)}
          onSaved={reload}
        />
      ) : null}

      <MoveMealDialog
        open={Boolean(moveMealTarget)}
        meal={moveMealTarget}
        mealTypes={mealTypes}
        onClose={() => setMoveMealTarget(null)}
        onMoved={reload}
      />

      <ConfirmActionDialog
        request={confirmAction.pending}
        onConfirm={confirmAction.confirm}
        onCancel={confirmAction.cancel}
      />
    </Stack>
  );
}
