import { beforeEach, describe, expect, it } from 'vitest';
import { mealPlanService } from '@/features/nutrition/services/mealPlanService';
import { nutritionDb } from '@/features/nutrition/services/nutritionMockDb';
import { nutritionScheduleAdapter } from './nutritionScheduleAdapter';

describe('nutritionScheduleAdapter', () => {
  beforeEach(() => {
    nutritionDb.plannedMeals = [];
  });

  it('fetches and converts planned meals into ScheduleEntry', async () => {
    const meal = await mealPlanService.addPlannedMeal({
      date: '2026-08-31',
      mealTypeId: 'meal-lunch',
      time: '12:30',
      contentType: 'note',
      note: 'Almoço Saudável',
    });

    const entries = await nutritionScheduleAdapter.getEntriesForDate('2026-08-31');
    expect(entries).toHaveLength(1);
    expect(entries[0]!.sourceType).toBe('nutrition');
    expect(entries[0]!.sourceId).toBe(meal.id);
    expect(entries[0]!.startAt).toBe('12:30');
    expect(entries[0]!.endAt).toBe('13:15');
    expect(entries[0]!.flexible).toBe(true);
  });

  it('syncs move back to mealPlanService', async () => {
    await mealPlanService.addPlannedMeal({
      date: '2026-08-31',
      mealTypeId: 'meal-dinner',
      time: '19:30',
      contentType: 'note',
      note: 'Jantar',
    });

    const [schedEntry] = await nutritionScheduleAdapter.getEntriesForDate('2026-08-31');
    expect(schedEntry).toBeDefined();

    await nutritionScheduleAdapter.onEntryRescheduled!(schedEntry!, '2026-09-01', '20:00');

    const oldMeals = await mealPlanService.getDailyMeals('2026-08-31');
    expect(oldMeals).toHaveLength(0);

    const newMeals = await mealPlanService.getDailyMeals('2026-09-01');
    expect(newMeals).toHaveLength(1);
    expect(newMeals[0]!.time).toBe('20:00');
  });
});

