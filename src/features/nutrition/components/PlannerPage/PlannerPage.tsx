'use client';

import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';

import { EmptyState, KokyuButton, KokyuTextField } from '@/design-system/components';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { usePreferences } from '@/features/settings/providers/PreferencesProvider';

import { getEnabledMealTypes } from '../../constants/mealTypes';
import { useConfirmAction } from '../../hooks/useConfirmAction';
import { useWeeklyPlan } from '../../hooks/useWeeklyPlan';
import { mealPlanService } from '../../services/mealPlanService';
import { shoppingService } from '../../services/shoppingService';
import type { MealQueueEntry, MealType, PlannedMeal } from '../../types/mealPlan.types';
import {
  formatDateHeading,
  fromDateKey,
  getWeekDays,
  getWeekStart,
  toDateKey,
} from '../../utils/dateHelpers';
import { AddMealDialog } from '../AddMealDialog/AddMealDialog';
import { ConfirmActionDialog } from '../ConfirmActionDialog/ConfirmActionDialog';
import { AddToPlanDialog } from '../AddToPlanDialog/AddToPlanDialog';
import { DuplicateDayDialog } from '../DuplicateDayDialog/DuplicateDayDialog';
import { GenerateShoppingListDialog } from '../GenerateShoppingListDialog/GenerateShoppingListDialog';
import { MealQueue } from '../MealQueue/MealQueue';
import { MoveMealDialog } from '../MoveMealDialog/MoveMealDialog';
import { WeekControl } from '../WeekControl/WeekControl';
import { WeeklyPlanner } from '../WeeklyPlanner/WeeklyPlanner';

/** `/app/nutricao/planejamento` — a full week, the recipe queue, and the bridge into Compras via "Gerar lista de compras". */
export function PlannerPage() {
  const { preferences } = usePreferences();
  const weekStartsOn = preferences.locale.weekStartsOn;
  const { showSuccess } = useSnackbar();
  const confirmAction = useConfirmAction();

  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date(), weekStartsOn));
  const weekDays = useMemo(() => getWeekDays(weekStart, weekStartsOn), [weekStart, weekStartsOn]);
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const { status, mealTypes, meals, recipes, ingredients, queue, reload } = useWeeklyPlan(weekDays);
  const ingredientsById = useMemo(
    () => new Map(ingredients.map((ingredient) => [ingredient.id, ingredient])),
    [ingredients],
  );

  const [addMealTarget, setAddMealTarget] = useState<{ date: string; mealType: MealType } | null>(
    null,
  );
  const [moveMealTarget, setMoveMealTarget] = useState<PlannedMeal | null>(null);
  const [assignQueueTarget, setAssignQueueTarget] = useState<MealQueueEntry | null>(null);
  const [generateShoppingOpen, setGenerateShoppingOpen] = useState(false);
  const [actionDay, setActionDay] = useState(() => toDateKey(new Date()));
  const [duplicateDayOpen, setDuplicateDayOpen] = useState(false);

  function handleWeekChange(nextWeekStart: Date) {
    setWeekStart(nextWeekStart);
    setActionDay(toDateKey(nextWeekStart));
  }

  function handleSlotClick(date: Date, mealType: MealType, meal?: PlannedMeal) {
    if (meal) {
      setMoveMealTarget(meal);
    } else {
      setAddMealTarget({ date: toDateKey(date), mealType });
    }
  }

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

  function handleDuplicateDay(targetDate: string) {
    mealPlanService.duplicateDay(actionDay, targetDate).then(() => {
      showSuccess(`Dia copiado para ${formatDateHeading(fromDateKey(targetDate))}.`);
      setDuplicateDayOpen(false);
      reload();
    });
  }

  function handleClearDay() {
    confirmAction.request({
      title: 'Limpar planejamento do dia?',
      description: 'Todas as refeições planejadas para este dia serão removidas.',
      confirmLabel: 'Limpar',
      onConfirm: () => {
        mealPlanService.clearDay(actionDay).then(() => {
          showSuccess('Planejamento do dia limpo.');
          reload();
        });
      },
    });
  }

  function handleAssignQueueEntry(date: string, mealTypeId: string) {
    if (!assignQueueTarget) return;
    mealPlanService.assignQueueEntryToDay(assignQueueTarget.id, date, mealTypeId).then(() => {
      showSuccess('Receita atribuída ao dia.');
      setAssignQueueTarget(null);
      reload();
    });
  }

  function handleRemoveQueueEntry(entry: MealQueueEntry) {
    mealPlanService.removeFromMealQueue(entry.id).then(reload);
  }

  async function handleConfirmShoppingList(
    summary: Parameters<typeof shoppingService.addShoppingItemsFromNeeds>[0],
  ) {
    await shoppingService.addShoppingItemsFromNeeds(summary, 'meal-plan');
    showSuccess('Lista de compras atualizada.');
    setGenerateShoppingOpen(false);
  }

  const recipeById = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const queuedRecipe = assignQueueTarget ? recipeById.get(assignQueueTarget.recipeId) : undefined;

  return (
    <Stack spacing={4}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' } }}
      >
        <Stack spacing={0.5}>
          <Typography variant="displaySmall" component="h1">
            Planejamento
          </Typography>
          <Typography
            variant="body1"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Organize sua semana com antecedência.
          </Typography>
        </Stack>
        <KokyuButton
          variant="contained"
          onClick={() => setGenerateShoppingOpen(true)}
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          Gerar lista de compras
        </KokyuButton>
      </Stack>

      <WeekControl weekStart={weekStart} weekStartsOn={weekStartsOn} onChange={handleWeekChange} />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { sm: 'center' } }}
      >
        <KokyuTextField
          select
          label="Dia"
          size="small"
          value={actionDay}
          onChange={(event) => setActionDay(event.target.value)}
          sx={{ minWidth: 200 }}
        >
          {weekDays.map((day) => (
            <MenuItem key={toDateKey(day)} value={toDateKey(day)}>
              {formatDateHeading(day)}
            </MenuItem>
          ))}
        </KokyuTextField>
        <KokyuButton variant="outlined" size="small" onClick={() => setDuplicateDayOpen(true)}>
          Copiar este dia
        </KokyuButton>
        <KokyuButton variant="outlined" size="small" onClick={handleClearDay}>
          Limpar planejamento do dia
        </KokyuButton>
      </Stack>

      {status === 'loading' ? (
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={320} />
        </Stack>
      ) : null}
      {status === 'error' ? (
        <Alert severity="error">
          Não foi possível carregar o planejamento agora. Tente novamente.
        </Alert>
      ) : null}

      {status === 'ready' && meals.length === 0 && queue.length === 0 ? (
        <EmptyState
          icon={CalendarMonthRoundedIcon}
          title="Sua semana ainda não tem refeições planejadas."
          description="Planeje sua primeira refeição para começar."
          action={
            <KokyuButton
              variant="contained"
              onClick={() =>
                setAddMealTarget({
                  date: toDateKey(new Date()),
                  mealType: getEnabledMealTypes(mealTypes)[0]!,
                })
              }
            >
              Planejar primeira refeição
            </KokyuButton>
          }
        />
      ) : null}

      {status === 'ready' ? (
        <>
          <MealQueue
            queue={queue}
            recipes={recipes}
            onAssign={setAssignQueueTarget}
            onRemove={handleRemoveQueueEntry}
          />

          <WeeklyPlanner
            weekDays={weekDays}
            mealTypes={mealTypes}
            meals={meals}
            recipes={recipes}
            ingredientsById={ingredientsById}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onSlotClick={handleSlotClick}
            onAddMeal={(mealType) => setAddMealTarget({ date: toDateKey(selectedDate), mealType })}
            onRemoveMeal={handleRemoveMeal}
            onTogglePrepared={handleTogglePrepared}
            onMoveMeal={setMoveMealTarget}
          />
        </>
      ) : null}

      {addMealTarget ? (
        <AddMealDialog
          open={Boolean(addMealTarget)}
          date={addMealTarget.date}
          mealType={addMealTarget.mealType}
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

      <AddToPlanDialog
        open={Boolean(assignQueueTarget)}
        target={
          queuedRecipe
            ? { recipeName: queuedRecipe.name, defaultServings: queuedRecipe.servings }
            : null
        }
        mealTypes={mealTypes}
        onClose={() => setAssignQueueTarget(null)}
        onConfirm={handleAssignQueueEntry}
      />

      <GenerateShoppingListDialog
        open={generateShoppingOpen}
        weekStart={weekStart}
        weekStartsOn={weekStartsOn}
        ingredients={ingredients}
        onClose={() => setGenerateShoppingOpen(false)}
        onConfirm={handleConfirmShoppingList}
      />

      <DuplicateDayDialog
        open={duplicateDayOpen}
        sourceDate={actionDay}
        onClose={() => setDuplicateDayOpen(false)}
        onConfirm={handleDuplicateDay}
      />

      <ConfirmActionDialog
        request={confirmAction.pending}
        onConfirm={confirmAction.confirm}
        onCancel={confirmAction.cancel}
      />
    </Stack>
  );
}
