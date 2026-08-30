import { beforeEach, describe, expect, it } from 'vitest';

import { nutritionDb, resetNutritionDb } from './nutritionMockDb';
import { pantryService } from './pantryService';

beforeEach(() => {
  resetNutritionDb();
});

describe('pantryService', () => {
  it('adds an item to the pantry', async () => {
    const item = await pantryService.addPantryItem({
      ingredientId: 'leite',
      quantity: 2,
      unit: 'l',
      storageLocationId: 'geladeira',
    });

    expect(await pantryService.getPantry()).toContainEqual(item);
  });

  it('edits an existing item', async () => {
    const item = await pantryService.addPantryItem({
      ingredientId: 'ovo',
      quantity: 6,
      unit: 'unidade',
      storageLocationId: 'geladeira',
    });

    const updated = await pantryService.updatePantryItem(item.id, { quantity: 12 });

    expect(updated?.quantity).toBe(12);
  });

  it('removes an item', async () => {
    const item = await pantryService.addPantryItem({
      ingredientId: 'sal',
      quantity: 100,
      unit: 'g',
      storageLocationId: 'despensa',
    });

    await pantryService.removePantryItem(item.id);

    expect((await pantryService.getPantry()).some((candidate) => candidate.id === item.id)).toBe(
      false,
    );
  });

  it('does not affect other items when editing one', async () => {
    const before = (await pantryService.getPantry()).length;
    const arroz = nutritionDb.pantryItems.find((item) => item.ingredientId === 'arroz')!;

    await pantryService.updatePantryItem(arroz.id, { quantity: 1500 });

    const after = await pantryService.getPantry();
    expect(after).toHaveLength(before);
    expect(after.find((item) => item.id === arroz.id)?.quantity).toBe(1500);
  });
});
