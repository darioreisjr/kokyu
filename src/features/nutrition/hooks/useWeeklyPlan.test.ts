import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { resetNutritionDb } from '../services/nutritionMockDb';
import { getWeekDays, getWeekStart } from '../utils/dateHelpers';
import { useWeeklyPlan } from './useWeeklyPlan';

describe('useWeeklyPlan', () => {
  beforeEach(() => {
    resetNutritionDb();
  });

  it('loads a week worth of meals, recipes, ingredients and the recipe queue', async () => {
    const weekDays = getWeekDays(getWeekStart(new Date(), 1), 1);
    const { result } = renderHook(() => useWeeklyPlan(weekDays));
    expect(result.current.status).toBe('loading');

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.mealTypes.length).toBeGreaterThan(0);
    expect(result.current.recipes.length).toBeGreaterThan(0);
    expect(result.current.ingredients.length).toBeGreaterThan(0);
    expect(result.current.queue.length).toBeGreaterThan(0);
  });

  it('does nothing (stays loading) when given an empty week', () => {
    const { result } = renderHook(() => useWeeklyPlan([]));
    expect(result.current.status).toBe('loading');
    expect(result.current.meals).toHaveLength(0);
  });
});
