import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mockEquipment } from '../mocks';
import { equipmentService } from '../services/equipmentService';
import { resetTrainingDb } from '../services/trainingMockDb';
import { useEquipment } from './useEquipment';

describe('useEquipment', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads the seeded equipment list', async () => {
    const { result } = renderHook(() => useEquipment());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.equipment).toHaveLength(mockEquipment.length);
    expect(result.current.equipment.map((item) => item.id)).toContain('equipment-barra');
  });

  it('moves to the error status when the service rejects', async () => {
    vi.spyOn(equipmentService, 'getEquipment').mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useEquipment());
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.equipment).toEqual([]);
  });
});
