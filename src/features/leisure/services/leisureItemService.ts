import type { DistributiveOmit, LeisureItem, LeisureItemType } from '../types/leisureItem.types';
import { generateId, leisureDb } from './leisureMockDb';

export type LeisureItemInput = DistributiveOmit<LeisureItem, 'id' | 'createdAt' | 'updatedAt'>;

/** Mocked — no real backend, no HTTP. */
export const leisureItemService = {
  async getLeisureItems(): Promise<LeisureItem[]> {
    return [...leisureDb.items];
  },

  async getLeisureItem(id: string): Promise<LeisureItem | null> {
    return leisureDb.items.find((item) => item.id === id) ?? null;
  },

  async createLeisureItem(input: LeisureItemInput): Promise<LeisureItem> {
    const now = new Date().toISOString();
    const item = {
      ...input,
      id: generateId('leisure'),
      createdAt: now,
      updatedAt: now,
    } as LeisureItem;
    leisureDb.items.push(item);
    return item;
  },

  async updateLeisureItem(
    id: string,
    patch: Partial<LeisureItemInput>,
  ): Promise<LeisureItem | null> {
    const index = leisureDb.items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    const updated = {
      ...leisureDb.items[index]!,
      ...patch,
      updatedAt: new Date().toISOString(),
    } as LeisureItem;
    leisureDb.items[index] = updated;
    return updated;
  },

  async deleteLeisureItem(id: string): Promise<void> {
    leisureDb.items = leisureDb.items.filter((item) => item.id !== id);
  },

  async archiveLeisureItem(id: string): Promise<LeisureItem | null> {
    const now = new Date().toISOString();
    return leisureItemService.updateLeisureItem(id, {
      status: 'archived',
      archivedAt: now,
    } as Partial<LeisureItemInput>);
  },

  async toggleFavorite(id: string): Promise<LeisureItem | null> {
    const index = leisureDb.items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    const existing = leisureDb.items[index]!;
    const updated = {
      ...existing,
      favorite: !existing.favorite,
      updatedAt: new Date().toISOString(),
    } as LeisureItem;
    leisureDb.items[index] = updated;
    return updated;
  },

  /** Merges a patch into the item's own type-specific data slice — e.g. `{ currentPage: 155 }` for a book. Never touches base fields. */
  async updateProgress(id: string, patch: Record<string, unknown>): Promise<LeisureItem | null> {
    const index = leisureDb.items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    const existing = leisureDb.items[index]!;
    const existingSlice = (existing as unknown as Record<string, unknown>)[existing.type];
    const updated = {
      ...existing,
      [existing.type]: {
        ...(typeof existingSlice === 'object' && existingSlice ? existingSlice : {}),
        ...patch,
      },
      updatedAt: new Date().toISOString(),
    } as unknown as LeisureItem;
    leisureDb.items[index] = updated;
    return updated;
  },

  /** "Organizar" a Quick Capture item — swaps its type (and type-specific slice) once the user classifies an "Ainda não sei" item, without touching its id or history. */
  async reclassifyLeisureItem(
    id: string,
    newType: LeisureItemType,
    typeData: Record<string, unknown> = {},
  ): Promise<LeisureItem | null> {
    const index = leisureDb.items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    const existing = leisureDb.items[index]!;
    const rest = { ...(existing as unknown as Record<string, unknown>) };
    delete rest[existing.type];
    const updated = {
      ...rest,
      type: newType,
      [newType]: typeData,
      updatedAt: new Date().toISOString(),
    } as unknown as LeisureItem;
    leisureDb.items[index] = updated;
    return updated;
  },
};
