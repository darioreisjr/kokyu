import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { trainingAnalyticsService } from '../services/trainingAnalyticsService';
import { resetTrainingDb } from '../services/trainingMockDb';
import { useTrainingAnalytics } from './useTrainingAnalytics';

describe('useTrainingAnalytics', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads the training analytics summary from the seeded history', async () => {
    const { result } = renderHook(() => useTrainingAnalytics());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.summary?.totalSessions).toBeGreaterThanOrEqual(4);
  });

  it('moves to the error status when the service rejects', async () => {
    vi.spyOn(trainingAnalyticsService, 'getTrainingAnalytics').mockRejectedValueOnce(
      new Error('boom'),
    );
    const { result } = renderHook(() => useTrainingAnalytics());
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.summary).toBeNull();
  });
});
