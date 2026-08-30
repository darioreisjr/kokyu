import type { StorageLocation } from '../types/pantry.types';

/** The three defaults — `id` stays a plain string everywhere else in this feature specifically so a future custom location slots in without a type change. */
export const defaultStorageLocations: StorageLocation[] = [
  { id: 'despensa', name: 'Despensa', order: 0 },
  { id: 'geladeira', name: 'Geladeira', order: 1 },
  { id: 'freezer', name: 'Freezer', order: 2 },
];

const locationById = new Map(defaultStorageLocations.map((location) => [location.id, location]));

export function getStorageLocationName(locationId: string): string {
  return locationById.get(locationId)?.name ?? locationId;
}
