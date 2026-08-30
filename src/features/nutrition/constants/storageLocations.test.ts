import { describe, expect, it } from 'vitest';

import { defaultStorageLocations, getStorageLocationName } from './storageLocations';

describe('storageLocations constants', () => {
  it('has the 3 default locations', () => {
    expect(defaultStorageLocations.map((location) => location.id)).toEqual([
      'despensa',
      'geladeira',
      'freezer',
    ]);
  });

  it('resolves a known location name', () => {
    expect(getStorageLocationName('geladeira')).toBe('Geladeira');
  });

  it('falls back to the raw id for an unknown location', () => {
    expect(getStorageLocationName('adega')).toBe('adega');
  });
});
