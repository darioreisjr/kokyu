import { beforeEach, describe, expect, it } from 'vitest';

import { equipmentService } from './equipmentService';
import { resetTrainingDb } from './trainingMockDb';

describe('equipmentService', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  it('returns every seeded equipment item', async () => {
    const equipment = await equipmentService.getEquipment();
    expect(equipment.length).toBeGreaterThan(0);
    expect(equipment.some((item) => item.id === 'equipment-barra')).toBe(true);
  });

  it('gets a single equipment item by id', async () => {
    const item = await equipmentService.getEquipmentItem('equipment-halteres');
    expect(item?.name).toBe('Halteres');
  });

  it('returns null for an equipment item that does not exist', async () => {
    const item = await equipmentService.getEquipmentItem('equipment-does-not-exist');
    expect(item).toBeNull();
  });

  it('creates a new equipment item with a generated id', async () => {
    const created = await equipmentService.createEquipment({
      name: 'Corda naval',
      category: 'other',
      active: true,
    });
    expect(created.id).toBeTruthy();
    const all = await equipmentService.getEquipment();
    expect(all.some((item) => item.id === created.id)).toBe(true);
  });

  it('updates an existing equipment item', async () => {
    const updated = await equipmentService.updateEquipment('equipment-barra', {
      name: 'Barra olímpica',
    });
    expect(updated?.name).toBe('Barra olímpica');
  });

  it('returns null when updating an equipment item that does not exist', async () => {
    const updated = await equipmentService.updateEquipment('equipment-does-not-exist', {
      name: 'x',
    });
    expect(updated).toBeNull();
  });

  it('deletes an equipment item', async () => {
    await equipmentService.deleteEquipment('equipment-barra');
    const all = await equipmentService.getEquipment();
    expect(all.some((item) => item.id === 'equipment-barra')).toBe(false);
  });

  it('does not throw when deleting an equipment item that does not exist', async () => {
    await expect(
      equipmentService.deleteEquipment('equipment-does-not-exist'),
    ).resolves.toBeUndefined();
  });
});
