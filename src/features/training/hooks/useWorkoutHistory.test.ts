import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { sessionService } from '../services/sessionService';
import { resetTrainingDb } from '../services/trainingMockDb';
import { useWorkoutHistory } from './useWorkoutHistory';

describe('useWorkoutHistory', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads every completed session when no filters are given', async () => {
    const { result } = renderHook(() => useWorkoutHistory());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.sessions.length).toBeGreaterThanOrEqual(4);
  });

  it('filters by routineId', async () => {
    const { result } = renderHook(() => useWorkoutHistory({ routineId: 'routine-push-a' }));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.sessions.every((session) => session.routineId === 'routine-push-a')).toBe(
      true,
    );
    expect(result.current.sessions.length).toBeGreaterThanOrEqual(2);
  });

  it('moves to the error status when the service rejects', async () => {
    vi.spyOn(sessionService, 'getWorkoutHistory').mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useWorkoutHistory());
    await waitFor(() => expect(result.current.status).toBe('error'));
  });

  it('reload() re-fetches from the service', async () => {
    const getHistorySpy = vi.spyOn(sessionService, 'getWorkoutHistory');
    const { result } = renderHook(() => useWorkoutHistory());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(getHistorySpy).toHaveBeenCalledTimes(1);

    result.current.reload();
    await waitFor(() => expect(getHistorySpy).toHaveBeenCalledTimes(2));
  });
});
