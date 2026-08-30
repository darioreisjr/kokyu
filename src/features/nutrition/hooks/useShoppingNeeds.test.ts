import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { resetNutritionDb } from '../services/nutritionMockDb';
import { toDateKey } from '../utils/dateHelpers';
import { useShoppingNeeds } from './useShoppingNeeds';

describe('useShoppingNeeds', () => {
  beforeEach(() => {
    resetNutritionDb();
  });

  it('starts with an empty summary and loads the real one for the given range', async () => {
    const today = toDateKey(new Date());
    const { result, rerender } = renderHook(
      ({ start, end, key }: { start: string; end: string; key: number }) =>
        useShoppingNeeds(start, end, key),
      {
        initialProps: { start: today, end: today, key: 0 },
      },
    );

    expect(result.current).toEqual({
      items: [],
      totalIngredients: 0,
      alreadyInPantry: 0,
      needsPurchase: 0,
    });

    await waitFor(() => expect(result.current.totalIngredients).toBeGreaterThan(0));

    rerender({ start: today, end: today, key: 1 });
    await waitFor(() => expect(result.current.totalIngredients).toBeGreaterThan(0));
  });
});
