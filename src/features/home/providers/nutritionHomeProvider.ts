import { mealPlanService } from '@/features/nutrition/services/mealPlanService';
import { pantryService } from '@/features/nutrition/services/pantryService';
import { shoppingService } from '@/features/nutrition/services/shoppingService';
import { getPantryFreshnessStatus } from '@/features/nutrition/utils/pantryFreshness';
import type {
  HomeProviderContext,
  HomeSectionProvider,
  NutritionHomeProjection,
} from '@/shared/home/types';

function toHHmm(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/**
 * Reads `mealPlanService`/`pantryService`/`shoppingService` — the same
 * services `useDailyMeals`/`PantryPage`/`ShoppingPage` read — for the
 * next planned meal today, the day's meal count, and how much pantry/
 * shopping attention is warranted. Never a copy of `PlannedMeal`/
 * `PantryItem`/`ShoppingItem`.
 */
export const nutritionHomeProvider: HomeSectionProvider<NutritionHomeProjection> = {
  sourceType: 'nutrition',
  label: 'Nutrição',

  async getHomeProjection(context: HomeProviderContext): Promise<NutritionHomeProjection> {
    const [meals, mealTypes, pantry, shoppingList] = await Promise.all([
      mealPlanService.getDailyMeals(context.date),
      mealPlanService.getMealTypes(),
      pantryService.getPantry(),
      shoppingService.getShoppingList(),
    ]);

    const mealTypeById = new Map(mealTypes.map((mealType) => [mealType.id, mealType]));
    const nowHHmm = toHHmm(context.now);

    const upcoming = meals
      .filter((meal) => !meal.prepared)
      .map((meal) => ({ meal, time: meal.time ?? mealTypeById.get(meal.mealTypeId)?.defaultTime }))
      .sort((a, b) => (a.time ?? '99:99').localeCompare(b.time ?? '99:99'));

    const nextMealEntry = upcoming.find((entry) => !entry.time || entry.time >= nowHHmm) ?? upcoming[0];

    const pantryUrgentCount = pantry.filter((item) => {
      const status = getPantryFreshnessStatus(item, context.now);
      return status === 'expiring' || status === 'expired';
    }).length;

    return {
      nextMeal: nextMealEntry
        ? {
            id: nextMealEntry.meal.id,
            mealTypeName: mealTypeById.get(nextMealEntry.meal.mealTypeId)?.name ?? 'Refeição',
            time: nextMealEntry.time,
            title: nextMealEntry.meal.note,
            prepared: nextMealEntry.meal.prepared,
          }
        : null,
      plannedMealsToday: meals.length,
      preparedMealsToday: meals.filter((meal) => meal.prepared).length,
      pantryUrgentCount,
      shoppingPendingCount: shoppingList.filter((item) => !item.checked).length,
    };
  },
};
