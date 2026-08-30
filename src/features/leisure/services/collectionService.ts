import type { LeisureCollection } from '../types/collection.types';
import { generateId, leisureDb } from './leisureMockDb';

export interface CollectionInput {
  name: string;
  description?: string;
  itemIds?: string[];
}

/** Mocked — no real backend. An item belongs to a collection by id only; it's never physically moved or duplicated. */
export const collectionService = {
  async getCollections(): Promise<LeisureCollection[]> {
    return [...leisureDb.collections];
  },

  async getCollection(id: string): Promise<LeisureCollection | null> {
    return leisureDb.collections.find((collection) => collection.id === id) ?? null;
  },

  async createCollection(input: CollectionInput): Promise<LeisureCollection> {
    const now = new Date().toISOString();
    const collection: LeisureCollection = {
      id: generateId('collection'),
      name: input.name,
      description: input.description,
      itemIds: input.itemIds ?? [],
      createdAt: now,
      updatedAt: now,
    };
    leisureDb.collections.push(collection);
    return collection;
  },

  async addItemToCollection(
    collectionId: string,
    itemId: string,
  ): Promise<LeisureCollection | null> {
    const index = leisureDb.collections.findIndex((collection) => collection.id === collectionId);
    if (index === -1) return null;
    const existing = leisureDb.collections[index]!;
    if (existing.itemIds.includes(itemId)) return existing;
    const updated = {
      ...existing,
      itemIds: [...existing.itemIds, itemId],
      updatedAt: new Date().toISOString(),
    };
    leisureDb.collections[index] = updated;
    return updated;
  },

  async removeItemFromCollection(
    collectionId: string,
    itemId: string,
  ): Promise<LeisureCollection | null> {
    const index = leisureDb.collections.findIndex((collection) => collection.id === collectionId);
    if (index === -1) return null;
    const existing = leisureDb.collections[index]!;
    const updated = {
      ...existing,
      itemIds: existing.itemIds.filter((id) => id !== itemId),
      updatedAt: new Date().toISOString(),
    };
    leisureDb.collections[index] = updated;
    return updated;
  },

  async deleteCollection(id: string): Promise<void> {
    leisureDb.collections = leisureDb.collections.filter((collection) => collection.id !== id);
  },
};
