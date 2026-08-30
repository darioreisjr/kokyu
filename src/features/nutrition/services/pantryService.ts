import type { PantryItem, StorageLocation } from '../types/pantry.types';
import type { Unit } from '../types/units.types';
import { generateId, nutritionDb } from './nutritionMockDb';

export interface PantryItemInput {
  ingredientId: string;
  quantity: number;
  unit: Unit;
  storageLocationId: string;
  purchaseDate?: string;
  expirationDate?: string;
  minimumStock?: number;
  notes?: string;
}

/** Mocked — no real backend. */
export const pantryService = {
  async getPantry(): Promise<PantryItem[]> {
    return [...nutritionDb.pantryItems];
  },

  async getStorageLocations(): Promise<StorageLocation[]> {
    return [...nutritionDb.storageLocations];
  },

  async addPantryItem(input: PantryItemInput): Promise<PantryItem> {
    const now = new Date().toISOString();
    const item: PantryItem = { id: generateId('pantry'), ...input, createdAt: now, updatedAt: now };
    nutritionDb.pantryItems.push(item);
    return item;
  },

  async updatePantryItem(id: string, patch: Partial<PantryItemInput>): Promise<PantryItem | null> {
    const index = nutritionDb.pantryItems.findIndex((item) => item.id === id);
    if (index === -1) return null;
    const updated: PantryItem = {
      ...nutritionDb.pantryItems[index]!,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    nutritionDb.pantryItems[index] = updated;
    return updated;
  },

  async removePantryItem(id: string): Promise<void> {
    nutritionDb.pantryItems = nutritionDb.pantryItems.filter((item) => item.id !== id);
  },
};
