import { beforeEach, describe, expect, it } from 'vitest';

import { mealPlanService } from './mealPlanService';
import { resetNutritionDb } from './nutritionMockDb';

// Far-future dates throughout — the mock planned meals are seeded
// relative to *today*, so a date near "now" would collide with
// pre-existing mock entries and throw off every count assertion here.
beforeEach(() => {
  resetNutritionDb();
});

describe('mealPlanService', () => {
  it('adds a planned meal for the right day', async () => {
    const meal = await mealPlanService.addPlannedMeal({
      date: '2030-01-01',
      mealTypeId: 'almoco',
      contentType: 'note',
      note: 'Almoçar fora',
    });

    const dailyMeals = await mealPlanService.getDailyMeals('2030-01-01');
    expect(dailyMeals.some((candidate) => candidate.id === meal.id)).toBe(true);
    expect(dailyMeals.find((candidate) => candidate.id === meal.id)?.note).toBe('Almoçar fora');
  });

  it('removes a planned meal', async () => {
    const meal = await mealPlanService.addPlannedMeal({
      date: '2030-01-01',
      mealTypeId: 'jantar',
      contentType: 'note',
      note: 'Livre',
    });
    await mealPlanService.removePlannedMeal(meal.id);

    const dailyMeals = await mealPlanService.getDailyMeals('2030-01-01');
    expect(dailyMeals.some((candidate) => candidate.id === meal.id)).toBe(false);
  });

  it('moves a planned meal to another day and meal type', async () => {
    const meal = await mealPlanService.addPlannedMeal({
      date: '2030-01-01',
      mealTypeId: 'almoco',
      contentType: 'note',
      note: 'Livre',
    });
    await mealPlanService.movePlannedMeal(meal.id, { date: '2030-01-03', mealTypeId: 'jantar' });

    expect(await mealPlanService.getDailyMeals('2030-01-01')).toHaveLength(0);
    const movedDay = await mealPlanService.getDailyMeals('2030-01-03');
    expect(movedDay).toHaveLength(1);
    expect(movedDay[0]?.mealTypeId).toBe('jantar');
  });

  it('copies a meal to multiple target dates without touching the original', async () => {
    const meal = await mealPlanService.addPlannedMeal({
      date: '2030-01-01',
      mealTypeId: 'almoco',
      contentType: 'recipe',
      recipeId: 'frango-arroz-feijao',
      servings: 4,
    });

    await mealPlanService.copyPlannedMeal(meal.id, ['2030-01-03', '2030-01-05']);

    expect(await mealPlanService.getDailyMeals('2030-01-01')).toHaveLength(1);
    expect(await mealPlanService.getDailyMeals('2030-01-03')).toHaveLength(1);
    expect(await mealPlanService.getDailyMeals('2030-01-05')).toHaveLength(1);
    const copy = (await mealPlanService.getDailyMeals('2030-01-03'))[0];
    expect(copy?.recipeId).toBe('frango-arroz-feijao');
    expect(copy?.id).not.toBe(meal.id);
  });

  it('duplicates every meal of a day onto another day', async () => {
    await mealPlanService.addPlannedMeal({
      date: '2030-01-01',
      mealTypeId: 'cafe-da-manha',
      contentType: 'note',
      note: 'Café',
    });
    await mealPlanService.addPlannedMeal({
      date: '2030-01-01',
      mealTypeId: 'almoco',
      contentType: 'note',
      note: 'Almoço',
    });

    await mealPlanService.duplicateDay('2030-01-01', '2030-01-02');

    expect(await mealPlanService.getDailyMeals('2030-01-02')).toHaveLength(2);
  });

  it('clears every meal planned for a day', async () => {
    await mealPlanService.addPlannedMeal({
      date: '2030-01-01',
      mealTypeId: 'almoco',
      contentType: 'note',
      note: 'x',
    });
    await mealPlanService.addPlannedMeal({
      date: '2030-01-01',
      mealTypeId: 'jantar',
      contentType: 'note',
      note: 'y',
    });

    await mealPlanService.clearDay('2030-01-01');

    expect(await mealPlanService.getDailyMeals('2030-01-01')).toHaveLength(0);
  });

  it('returns meals within a week range, excluding meals outside it', async () => {
    await mealPlanService.addPlannedMeal({
      date: '2030-01-01',
      mealTypeId: 'almoco',
      contentType: 'note',
      note: 'dentro',
    });
    await mealPlanService.addPlannedMeal({
      date: '2030-01-10',
      mealTypeId: 'almoco',
      contentType: 'note',
      note: 'fora',
    });

    const week = await mealPlanService.getWeeklyMealPlan('2029-12-30');
    expect(week.some((meal) => meal.note === 'dentro')).toBe(true);
    expect(week.some((meal) => meal.note === 'fora')).toBe(false);
  });

  it('adds a recipe to the queue and assigns it to a day, removing it from the queue', async () => {
    const queueBefore = await mealPlanService.getMealQueue();
    const entry = await mealPlanService.addToMealQueue('omelete-aveia');
    expect(await mealPlanService.getMealQueue()).toHaveLength(queueBefore.length + 1);

    const meal = await mealPlanService.assignQueueEntryToDay(
      entry.id,
      '2030-01-01',
      'cafe-da-manha',
    );

    expect(meal?.recipeId).toBe('omelete-aveia');
    expect(
      (await mealPlanService.getMealQueue()).some((candidate) => candidate.id === entry.id),
    ).toBe(false);
  });
});
