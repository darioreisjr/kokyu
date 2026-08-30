import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { resetNutritionDb } from '../services/nutritionMockDb';
import { toDateKey } from '../utils/dateHelpers';
import { useDailyMeals } from './useDailyMeals';

describe('useDailyMeals', () => {
  beforeEach(() => {
    resetNutritionDb();
  });

  it("loads meal types, today's meals, recipes and ingredients", async () => {
    const { result } = renderHook(() => useDailyMeals(new Date()));
    expect(result.current.status).toBe('loading');

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.mealTypes.length).toBeGreaterThan(0);
    expect(result.current.meals.length).toBeGreaterThan(0);
    expect(result.current.recipes.length).toBeGreaterThan(0);
    expect(result.current.ingredients.length).toBeGreaterThan(0);
  });

  it('reloads meals for a date with nothing planned', async () => {
    const farFuture = new Date(2030, 0, 1);
    const { result } = renderHook(() => useDailyMeals(farFuture));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.meals).toHaveLength(0);
    expect(toDateKey(farFuture)).toBe('2030-01-01');
  });

  it('reload() re-fetches without changing the date', async () => {
    const { result } = renderHook(() => useDailyMeals(new Date()));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    const initialCount = result.current.meals.length;

    act(() => {
      result.current.reload();
    });

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.meals.length).toBe(initialCount);
  });
});
