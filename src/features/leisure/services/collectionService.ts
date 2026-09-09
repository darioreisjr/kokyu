import { apiFetchClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';

import type { LeisureCollection } from '../types/collection.types';

export interface CollectionInput {
  name: string;
  description?: string;
  itemIds?: string[];
}

export const collectionService = {
  async getCollections(): Promise<LeisureCollection[]> {
    return apiFetchClient<LeisureCollection[]>('/leisure/collections');
  },

  async getCollection(id: string): Promise<LeisureCollection | null> {
    try {
      return await apiFetchClient<LeisureCollection>(`/leisure/collections/${id}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  async createCollection(input: CollectionInput): Promise<LeisureCollection> {
    return apiFetchClient<LeisureCollection>('/leisure/collections', {
      method: 'POST',
      body: input,
    });
  },

  async addItemToCollection(
    collectionId: string,
    itemId: string,
  ): Promise<LeisureCollection | null> {
    try {
      return await apiFetchClient<LeisureCollection>(`/leisure/collections/${collectionId}/items`, {
        method: 'POST',
        body: { itemId },
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  async removeItemFromCollection(
    collectionId: string,
    itemId: string,
  ): Promise<LeisureCollection | null> {
    try {
      return await apiFetchClient<LeisureCollection>(
        `/leisure/collections/${collectionId}/items/${itemId}`,
        { method: 'DELETE' },
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  async deleteCollection(id: string): Promise<void> {
    await apiFetchClient<void>(`/leisure/collections/${id}`, { method: 'DELETE' });
  },
};
