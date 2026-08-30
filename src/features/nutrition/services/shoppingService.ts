import { buildShoppingItemsFromNeeds } from '../utils/calculateShoppingNeeds';
import type { ShoppingItem, ShoppingItemSource } from '../types/shopping.types';
import type { ShoppingNeedsSummary } from '../types/shoppingNeeds.types';
import type { Unit } from '../types/units.types';
import { generateId, nutritionDb } from './nutritionMockDb';

export interface ShoppingItemInput {
  ingredientId?: string;
  name?: string;
  quantity: number;
  unit: Unit;
  category: ShoppingItem['category'];
  source?: ShoppingItemSource;
  notes?: string;
}

/** Mocked — no real backend. */
export const shoppingService = {
  async getShoppingList(): Promise<ShoppingItem[]> {
    return [...nutritionDb.shoppingItems];
  },

  async addShoppingItem(input: ShoppingItemInput): Promise<ShoppingItem> {
    const item: ShoppingItem = {
      id: generateId('shopping'),
      checked: false,
      source: input.source ?? 'manual',
      createdAt: new Date().toISOString(),
      ...input,
    };
    nutritionDb.shoppingItems.push(item);
    return item;
  },

  /** Adds every ingredient with an actual shortfall from a `ShoppingNeedsSummary` — duplicates against an ingredient already on the list are merged, not appended as a second line. */
  async addShoppingItemsFromNeeds(
    summary: ShoppingNeedsSummary,
    source: ShoppingItemSource,
  ): Promise<ShoppingItem[]> {
    const ingredientsById = new Map(
      nutritionDb.ingredients.map((ingredient) => [ingredient.id, ingredient]),
    );
    const newItems = buildShoppingItemsFromNeeds(summary, ingredientsById, source, () =>
      generateId('shopping'),
    );

    for (const newItem of newItems) {
      const existing = nutritionDb.shoppingItems.find(
        (item) =>
          item.ingredientId === newItem.ingredientId && item.unit === newItem.unit && !item.checked,
      );
      if (existing) {
        existing.quantity += newItem.quantity;
        existing.recipeIds = Array.from(
          new Set([...(existing.recipeIds ?? []), ...(newItem.recipeIds ?? [])]),
        );
        existing.plannedMealIds = Array.from(
          new Set([...(existing.plannedMealIds ?? []), ...(newItem.plannedMealIds ?? [])]),
        );
      } else {
        nutritionDb.shoppingItems.push(newItem);
      }
    }
    return [...nutritionDb.shoppingItems];
  },

  async toggleShoppingItem(id: string): Promise<ShoppingItem | null> {
    const index = nutritionDb.shoppingItems.findIndex((item) => item.id === id);
    if (index === -1) return null;
    const updated = {
      ...nutritionDb.shoppingItems[index]!,
      checked: !nutritionDb.shoppingItems[index]!.checked,
    };
    nutritionDb.shoppingItems[index] = updated;
    return updated;
  },

  async removeShoppingItem(id: string): Promise<void> {
    nutritionDb.shoppingItems = nutritionDb.shoppingItems.filter((item) => item.id !== id);
  },

  async clearPurchased(): Promise<void> {
    nutritionDb.shoppingItems = nutritionDb.shoppingItems.filter((item) => !item.checked);
  },

  /** Moves one purchased item into the pantry at `storageLocationId`, keeping its quantity/unit, then removes it from the shopping list. */
  async moveShoppingItemToPantry(id: string, storageLocationId: string): Promise<void> {
    const item = nutritionDb.shoppingItems.find((entry) => entry.id === id);
    if (!item || !item.ingredientId) return;

    const now = new Date().toISOString();
    nutritionDb.pantryItems.push({
      id: generateId('pantry'),
      ingredientId: item.ingredientId,
      quantity: item.quantity,
      unit: item.unit,
      storageLocationId,
      purchaseDate: now.slice(0, 10),
      createdAt: now,
      updatedAt: now,
    });
    nutritionDb.shoppingItems = nutritionDb.shoppingItems.filter((entry) => entry.id !== id);
  },

  /** "Guardar itens comprados" — every checked item with a real ingredient, one confirmed storage location for all of them. */
  async moveAllPurchasedToPantry(storageLocationId: string): Promise<number> {
    const purchased = nutritionDb.shoppingItems.filter((item) => item.checked && item.ingredientId);
    for (const item of purchased) {
      await shoppingService.moveShoppingItemToPantry(item.id, storageLocationId);
    }
    return purchased.length;
  },
};
