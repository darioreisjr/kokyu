import type { Unit } from './units.types';

/** `despensa`/`geladeira`/`freezer` ship as the three defaults; the `id` stays a plain string so a future custom location ("Adega") is just another row, not a new union member. */
export interface StorageLocation {
  id: string;
  name: string;
  order: number;
}

export interface PantryItem {
  id: string;
  ingredientId: string;
  quantity: number;
  unit: Unit;
  storageLocationId: string;
  purchaseDate?: string;
  expirationDate?: string;
  /** Below this quantity, the item counts as "Estoque baixo". */
  minimumStock?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PantryFreshnessStatus = 'fresh' | 'expiring' | 'expired' | 'unknown';
