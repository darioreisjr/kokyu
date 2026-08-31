import { mealPlanService } from '@/features/nutrition/services/mealPlanService';
import { nutritionDb } from '@/features/nutrition/services/nutritionMockDb';
import type { ScheduleEntry, ScheduleSourceAdapter } from '@/shared/scheduling/types';
import { addMinutesToTime } from '@/shared/scheduling/utils/timeHelpers';

export const nutritionScheduleAdapter: ScheduleSourceAdapter = {
  sourceType: 'nutrition',
  label: 'Nutrição',

  async getEntriesForDate(date: string): Promise<ScheduleEntry[]> {
    const meals = await mealPlanService.getDailyMeals(date);
    const mealTypes = await mealPlanService.getMealTypes();
    const typeMap = new Map(mealTypes.map((t) => [t.id, t]));

    return meals.map((meal) => {
      const type = typeMap.get(meal.mealTypeId);
      let title = type?.name || 'Refeição';

      if (meal.contentType === 'recipe' && meal.recipeId) {
        const recipe = nutritionDb.recipes.find((r) => r.id === meal.recipeId);
        if (recipe) {
          title = `${type?.name || 'Refeição'}: ${recipe.name}`;
        }
      } else if (meal.note) {
        title = `${type?.name || 'Refeição'}: ${meal.note}`;
      }

      const duration = 45;
      const startAt = meal.time || type?.defaultTime;
      const endAt = startAt ? addMinutesToTime(startAt, duration) : undefined;

      return {
        id: `nutrition-${meal.id}`,
        sourceType: 'nutrition',
        sourceId: meal.id,
        title,
        date: meal.date,
        startAt,
        endAt,
        duration,
        allDay: false,
        flexible: true,
        locked: false,
        splittable: false,
        status: meal.prepared ? 'completed' : 'planned',
        priority: 'medium',
        context: 'health',
        colorToken: 'schedule.source.nutrition',
        icon: 'RestaurantRounded',
        syncMode: 'bidirectional',
        metadata: {
          mealTypeId: meal.mealTypeId,
          recipeId: meal.recipeId,
          contentType: meal.contentType,
        },
        createdAt: meal.createdAt,
        updatedAt: meal.createdAt,
      };
    });
  },

  async getUnscheduledEntries(date: string): Promise<ScheduleEntry[]> {
    const entries = await nutritionScheduleAdapter.getEntriesForDate(date);
    return entries.filter((e) => !e.startAt && e.status === 'planned');
  },

  async onEntryRescheduled(
    entry: ScheduleEntry,
    newDate: string,
    newStartAt?: string,
  ): Promise<boolean> {
    const updated = await mealPlanService.movePlannedMeal(entry.sourceId, {
      date: newDate,
      time: newStartAt,
    });
    return Boolean(updated);
  },

  async onEntryCompleted(entry: ScheduleEntry): Promise<boolean> {
    const updated = await mealPlanService.updatePlannedMeal(entry.sourceId, {
      prepared: true,
    });
    return Boolean(updated);
  },

  async onEntryDeleted(entry: ScheduleEntry): Promise<boolean> {
    await mealPlanService.removePlannedMeal(entry.sourceId);
    return true;
  },
};

