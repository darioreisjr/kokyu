import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { personalRecordService } from '../services/personalRecordService';
import { resetTrainingDb } from '../services/trainingMockDb';
import { usePersonalRecords } from './usePersonalRecords';

describe('usePersonalRecords', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads every seeded personal record when no exercise filter is given', async () => {
    const { result } = renderHook(() => usePersonalRecords());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.records.length).toBeGreaterThanOrEqual(6);
  });

  it('filters by exerciseId', async () => {
    const { result } = renderHook(() => usePersonalRecords('exercise-supino-reto'));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(
      result.current.records.every((record) => record.exerciseId === 'exercise-supino-reto'),
    ).toBe(true);
  });

  it('moves to the error status when the service rejects', async () => {
    vi.spyOn(personalRecordService, 'getPersonalRecords').mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => usePersonalRecords());
    await waitFor(() => expect(result.current.status).toBe('error'));
  });

  it('reload() re-fetches from the service', async () => {
    const getRecordsSpy = vi.spyOn(personalRecordService, 'getPersonalRecords');
    const { result } = renderHook(() => usePersonalRecords());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(getRecordsSpy).toHaveBeenCalledTimes(1);

    result.current.reload();
    await waitFor(() => expect(getRecordsSpy).toHaveBeenCalledTimes(2));
  });
});
