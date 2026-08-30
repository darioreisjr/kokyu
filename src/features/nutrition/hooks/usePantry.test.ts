import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { resetNutritionDb } from '../services/nutritionMockDb';
import { usePantry } from './usePantry';

describe('usePantry', () => {
  beforeEach(() => {
    resetNutritionDb();
  });

  it('loads pantry items, ingredients and storage locations', async () => {
    const { result } = renderHook(() => usePantry());
    expect(result.current.status).toBe('loading');

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.items.length).toBeGreaterThan(0);
    expect(result.current.ingredients.length).toBeGreaterThan(0);
    expect(result.current.storageLocations.map((location) => location.id)).toEqual([
      'despensa',
      'geladeira',
      'freezer',
    ]);
  });
});
