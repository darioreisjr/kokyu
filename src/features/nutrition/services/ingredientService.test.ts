import { beforeEach, describe, expect, it } from 'vitest';

import { ingredientService } from './ingredientService';
import { resetNutritionDb } from './nutritionMockDb';

beforeEach(() => {
  resetNutritionDb();
});

describe('ingredientService', () => {
  it('resolves an existing ingredient by exact name without creating a duplicate', async () => {
    const before = (await ingredientService.getIngredients()).length;

    const resolved = await ingredientService.findOrCreateByName('Arroz branco', 'graos', 'g');

    expect(resolved.id).toBe('arroz');
    expect(await ingredientService.getIngredients()).toHaveLength(before);
  });

  it('resolves an existing ingredient even when the case/accents differ', async () => {
    const resolved = await ingredientService.findOrCreateByName('arroz BRANCO', 'graos', 'g');

    expect(resolved.id).toBe('arroz');
  });

  it('creates a new ingredient when nothing matches, exactly once for repeated calls with the same name', async () => {
    const before = (await ingredientService.getIngredients()).length;

    const first = await ingredientService.findOrCreateByName('Quinoa', 'graos', 'g');
    const second = await ingredientService.findOrCreateByName('Quinoa', 'graos', 'g');

    expect(first.id).toBe(second.id);
    expect(await ingredientService.getIngredients()).toHaveLength(before + 1);
  });

  it('searches by normalized name and alias', async () => {
    const results = await ingredientService.searchIngredients('frango');
    expect(results.some((ingredient) => ingredient.id === 'frango')).toBe(true);
  });
});
