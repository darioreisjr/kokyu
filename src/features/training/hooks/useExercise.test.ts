import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { exerciseService } from '../services/exerciseService';
import { resetTrainingDb } from '../services/trainingMockDb';
import { useExercise } from './useExercise';

describe('useExercise', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads an exercise by id', async () => {
    const { result } = renderHook(() => useExercise('exercise-supino-reto'));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.exercise?.name).toBe('Supino reto');
  });

  it('resolves with a null exercise for an id that does not exist', async () => {
    const { result } = renderHook(() => useExercise('exercise-does-not-exist'));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.exercise).toBeNull();
  });

  it('moves to the error status when the service rejects', async () => {
    vi.spyOn(exerciseService, 'getExercise').mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useExercise('exercise-supino-reto'));
    await waitFor(() => expect(result.current.status).toBe('error'));
  });

  it('reload() re-fetches from the service', async () => {
    const getExerciseSpy = vi.spyOn(exerciseService, 'getExercise');
    const { result } = renderHook(() => useExercise('exercise-supino-reto'));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(getExerciseSpy).toHaveBeenCalledTimes(1);

    result.current.reload();
    await waitFor(() => expect(getExerciseSpy).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.status).toBe('ready'));
  });
});
