import { beforeEach, describe, expect, it } from 'vitest';

import { nutritionDb, resetNutritionDb } from './nutritionMockDb';
import { shoppingService } from './shoppingService';

beforeEach(() => {
  resetNutritionDb();
});

describe('shoppingService', () => {
  it('adds a manual item', async () => {
    const item = await shoppingService.addShoppingItem({
      name: 'Guardanapo',
      quantity: 1,
      unit: 'pacote',
      category: 'outros',
    });

    expect(await shoppingService.getShoppingList()).toContainEqual(item);
    expect(item.source).toBe('manual');
    expect(item.checked).toBe(false);
  });

  it('toggles an item checked and back to unchecked', async () => {
    const item = await shoppingService.addShoppingItem({
      name: 'Papel alumínio',
      quantity: 1,
      unit: 'unidade',
      category: 'outros',
    });

    const checked = await shoppingService.toggleShoppingItem(item.id);
    expect(checked?.checked).toBe(true);

    const unchecked = await shoppingService.toggleShoppingItem(item.id);
    expect(unchecked?.checked).toBe(false);
  });

  it('clears only purchased items', async () => {
    const pending = await shoppingService.addShoppingItem({
      name: 'Item pendente',
      quantity: 1,
      unit: 'unidade',
      category: 'outros',
    });
    const purchased = await shoppingService.addShoppingItem({
      name: 'Item comprado',
      quantity: 1,
      unit: 'unidade',
      category: 'outros',
    });
    await shoppingService.toggleShoppingItem(purchased.id);

    await shoppingService.clearPurchased();

    const remaining = await shoppingService.getShoppingList();
    expect(remaining.some((item) => item.id === pending.id)).toBe(true);
    expect(remaining.some((item) => item.id === purchased.id)).toBe(false);
  });

  it('merges shopping needs into an existing unchecked item for the same ingredient/unit instead of duplicating', async () => {
    const initialCount = (await shoppingService.getShoppingList()).length;
    // The mock list already has a "feijao" (g) item from low stock.
    const summary = {
      items: [
        {
          ingredientId: 'feijao',
          neededQuantity: 200,
          unit: 'g' as const,
          availableQuantity: 0,
          shortfallQuantity: 200,
          sourceMealIds: [],
          sourceRecipeIds: [],
        },
      ],
      totalIngredients: 1,
      alreadyInPantry: 0,
      needsPurchase: 1,
    };
    const existing = nutritionDb.shoppingItems.find(
      (item) => item.ingredientId === 'feijao' && !item.checked,
    )!;
    const quantityBefore = existing.quantity;

    await shoppingService.addShoppingItemsFromNeeds(summary, 'meal-plan');

    const afterCount = (await shoppingService.getShoppingList()).length;
    expect(afterCount).toBe(initialCount);
    expect(existing.quantity).toBe(quantityBefore + 200);
  });

  it('moves a purchased item to the pantry and removes it from the shopping list', async () => {
    const item = await shoppingService.addShoppingItem({
      ingredientId: 'leite',
      quantity: 1,
      unit: 'l',
      category: 'laticinios',
    });
    await shoppingService.toggleShoppingItem(item.id);

    await shoppingService.moveShoppingItemToPantry(item.id, 'geladeira');

    expect(
      (await shoppingService.getShoppingList()).some((candidate) => candidate.id === item.id),
    ).toBe(false);
    expect(
      nutritionDb.pantryItems.some(
        (pantryItem) => pantryItem.ingredientId === 'leite' && pantryItem.quantity === 1,
      ),
    ).toBe(true);
  });

  it('moves every purchased item with a real ingredient to the pantry in one action', async () => {
    // Starts from a clean slate — the mock list ships with its own already-checked item.
    await shoppingService.clearPurchased();
    const first = await shoppingService.addShoppingItem({
      ingredientId: 'ovo',
      quantity: 6,
      unit: 'unidade',
      category: 'ovos',
    });
    const second = await shoppingService.addShoppingItem({
      ingredientId: 'queijo',
      quantity: 200,
      unit: 'g',
      category: 'laticinios',
    });
    const manual = await shoppingService.addShoppingItem({
      name: 'Guardanapo',
      quantity: 1,
      unit: 'pacote',
      category: 'outros',
    });
    await shoppingService.toggleShoppingItem(first.id);
    await shoppingService.toggleShoppingItem(second.id);
    await shoppingService.toggleShoppingItem(manual.id);

    const movedCount = await shoppingService.moveAllPurchasedToPantry('despensa');

    expect(movedCount).toBe(2);
    expect((await shoppingService.getShoppingList()).some((item) => item.id === manual.id)).toBe(
      true,
    );
  });
});
