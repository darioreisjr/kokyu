import { beforeEach, describe, expect, it } from 'vitest';

import { trainingLocationService } from './trainingLocationService';
import { resetTrainingDb } from './trainingMockDb';

describe('trainingLocationService', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  it('returns every seeded location', async () => {
    const locations = await trainingLocationService.getLocations();
    expect(locations.map((location) => location.id)).toEqual(
      expect.arrayContaining(['location-academia', 'location-casa']),
    );
  });

  it('gets a single location by id', async () => {
    const location = await trainingLocationService.getLocation('location-academia');
    expect(location?.name).toBe('Academia');
  });

  it('returns null for a location that does not exist', async () => {
    const location = await trainingLocationService.getLocation('location-does-not-exist');
    expect(location).toBeNull();
  });

  it('creates a new location with a generated id', async () => {
    const created = await trainingLocationService.createLocation({
      name: 'Parque',
      type: 'outdoor',
      equipmentIds: [],
    });
    expect(created.id).toBeTruthy();
    const all = await trainingLocationService.getLocations();
    expect(all.some((location) => location.id === created.id)).toBe(true);
  });

  it('updates an existing location', async () => {
    const updated = await trainingLocationService.updateLocation('location-casa', {
      name: 'Apartamento',
    });
    expect(updated?.name).toBe('Apartamento');
  });

  it('returns null when updating a location that does not exist', async () => {
    const updated = await trainingLocationService.updateLocation('location-does-not-exist', {
      name: 'x',
    });
    expect(updated).toBeNull();
  });

  it('deletes a location', async () => {
    await trainingLocationService.deleteLocation('location-casa');
    const all = await trainingLocationService.getLocations();
    expect(all.some((location) => location.id === 'location-casa')).toBe(false);
  });

  it('does not throw when deleting a location that does not exist', async () => {
    await expect(
      trainingLocationService.deleteLocation('location-does-not-exist'),
    ).resolves.toBeUndefined();
  });
});
