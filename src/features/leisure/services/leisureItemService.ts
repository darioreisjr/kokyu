import { apiFetchClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';

import type { DistributiveOmit, LeisureItem, LeisureItemType } from '../types/leisureItem.types';

export type LeisureItemInput = DistributiveOmit<LeisureItem, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Real kokyu-sam backend implementation - GET/POST/PATCH bodies already
 * match `LeisureItemInput`'s wire shape 1:1 (the type-specific slice keyed
 * by `type`, e.g. `{ type: 'movie', movie: {...} }`), so no mapping layer
 * is needed here, unlike profileService's `mapCurrentUserToProfile`.
 */
export const leisureItemService = {
  async getLeisureItems(): Promise<LeisureItem[]> {
    return apiFetchClient<LeisureItem[]>('/leisure/items');
  },

  async getLeisureItem(id: string): Promise<LeisureItem | null> {
    try {
      return await apiFetchClient<LeisureItem>(`/leisure/items/${id}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  async createLeisureItem(input: LeisureItemInput): Promise<LeisureItem> {
    return apiFetchClient<LeisureItem>('/leisure/items', { method: 'POST', body: input });
  },

  async updateLeisureItem(
    id: string,
    patch: Partial<LeisureItemInput>,
  ): Promise<LeisureItem | null> {
    try {
      return await apiFetchClient<LeisureItem>(`/leisure/items/${id}`, {
        method: 'PATCH',
        body: patch,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  async deleteLeisureItem(id: string): Promise<void> {
    await apiFetchClient<void>(`/leisure/items/${id}`, { method: 'DELETE' });
  },

  async archiveLeisureItem(id: string): Promise<LeisureItem | null> {
    try {
      return await apiFetchClient<LeisureItem>(`/leisure/items/${id}/archive`, { method: 'POST' });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  async toggleFavorite(id: string): Promise<LeisureItem | null> {
    try {
      return await apiFetchClient<LeisureItem>(`/leisure/items/${id}/favorite`, { method: 'POST' });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  /** Merges a patch into the item's own type-specific data slice - e.g. `{ currentPage: 155 }` for a book. Never touches base fields. */
  async updateProgress(id: string, patch: Record<string, unknown>): Promise<LeisureItem | null> {
    try {
      return await apiFetchClient<LeisureItem>(`/leisure/items/${id}/progress`, {
        method: 'PATCH',
        body: { progress: patch },
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  /** "Organizar" a Quick Capture item - swaps its type (and type-specific slice) once the user classifies an "Ainda não sei" item, without touching its id or history. */
  async reclassifyLeisureItem(
    id: string,
    newType: LeisureItemType,
    typeData: Record<string, unknown> = {},
  ): Promise<LeisureItem | null> {
    try {
      return await apiFetchClient<LeisureItem>(`/leisure/items/${id}/reclassify`, {
        method: 'POST',
        body: { type: newType, details: typeData },
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },
};
