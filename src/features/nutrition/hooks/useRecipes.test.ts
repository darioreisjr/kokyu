import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { resetNutritionDb } from '../services/nutritionMockDb';
import { useRecipes } from './useRecipes';

describe('useRecipes', () => {
  beforeEach(() => {
    resetNutritionDb();
  });

  it('loads recipes alongside the live pantry', async () => {
    const { result } = renderHook(() => useRecipes());
    expect(result.current.status).toBe('loading');

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.recipes.length).toBeGreaterThan(0);
    expect(result.current.pantryItems.length).toBeGreaterThan(0);
  });
});
