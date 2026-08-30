import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { trainingAnalyticsService } from '../services/trainingAnalyticsService';
import { resetTrainingDb } from '../services/trainingMockDb';
import { useExerciseTrend } from './useExerciseTrend';

describe('useExerciseTrend', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads e1RM trend points for an exercise trained across multiple sessions', async () => {
    const { result } = renderHook(() => useExerciseTrend('exercise-supino-reto'));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.trend.length).toBeGreaterThanOrEqual(2);
  });

  it('resolves with an empty trend for an exercise never performed', async () => {
    const { result } = renderHook(() => useExerciseTrend('exercise-prancha'));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.trend).toEqual([]);
  });

  it('moves to the error status when the service rejects', async () => {
    vi.spyOn(trainingAnalyticsService, 'getExerciseTrend').mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useExerciseTrend('exercise-supino-reto'));
    await waitFor(() => expect(result.current.status).toBe('error'));
  });
});
