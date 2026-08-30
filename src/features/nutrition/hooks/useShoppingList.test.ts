import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { resetNutritionDb } from '../services/nutritionMockDb';
import { useShoppingList } from './useShoppingList';

describe('useShoppingList', () => {
  beforeEach(() => {
    resetNutritionDb();
  });

  it('loads shopping items, ingredients and storage locations', async () => {
    const { result } = renderHook(() => useShoppingList());
    expect(result.current.status).toBe('loading');

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.items.length).toBeGreaterThan(0);
    expect(result.current.ingredients.length).toBeGreaterThan(0);
    expect(result.current.storageLocations.length).toBe(3);
  });
});
