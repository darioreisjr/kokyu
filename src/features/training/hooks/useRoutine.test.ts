import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { routineService } from '../services/routineService';
import { resetTrainingDb } from '../services/trainingMockDb';
import { useRoutine } from './useRoutine';

describe('useRoutine', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads a routine by id', async () => {
    const { result } = renderHook(() => useRoutine('routine-push-a'));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.routine?.name).toBe('Push A');
  });

  it('resolves with a null routine for an id that does not exist', async () => {
    const { result } = renderHook(() => useRoutine('routine-does-not-exist'));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.routine).toBeNull();
  });

  it('moves to the error status when the service rejects', async () => {
    vi.spyOn(routineService, 'getRoutine').mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useRoutine('routine-push-a'));
    await waitFor(() => expect(result.current.status).toBe('error'));
  });

  it('reload() re-fetches from the service', async () => {
    const getRoutineSpy = vi.spyOn(routineService, 'getRoutine');
    const { result } = renderHook(() => useRoutine('routine-push-a'));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(getRoutineSpy).toHaveBeenCalledTimes(1);

    result.current.reload();
    await waitFor(() => expect(getRoutineSpy).toHaveBeenCalledTimes(2));
  });
});
