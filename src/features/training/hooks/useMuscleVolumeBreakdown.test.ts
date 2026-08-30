import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { trainingAnalyticsService } from '../services/trainingAnalyticsService';
import { resetTrainingDb } from '../services/trainingMockDb';
import { useMuscleVolumeBreakdown } from './useMuscleVolumeBreakdown';

describe('useMuscleVolumeBreakdown', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads the muscle volume breakdown for the default 7-day range', async () => {
    const { result } = renderHook(() => useMuscleVolumeBreakdown());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(Array.isArray(result.current.entries)).toBe(true);
  });

  it('accepts a custom range and returns at least as much volume as a narrower one', async () => {
    const wide = renderHook(() => useMuscleVolumeBreakdown(30));
    await waitFor(() => expect(wide.result.current.status).toBe('ready'));
    const narrow = renderHook(() => useMuscleVolumeBreakdown(1));
    await waitFor(() => expect(narrow.result.current.status).toBe('ready'));

    const wideTotal = wide.result.current.entries.reduce(
      (total, entry) => total + entry.directSets,
      0,
    );
    const narrowTotal = narrow.result.current.entries.reduce(
      (total, entry) => total + entry.directSets,
      0,
    );
    expect(wideTotal).toBeGreaterThanOrEqual(narrowTotal);
  });

  it('moves to the error status when the service rejects', async () => {
    vi.spyOn(trainingAnalyticsService, 'getMuscleVolumeBreakdown').mockRejectedValueOnce(
      new Error('boom'),
    );
    const { result } = renderHook(() => useMuscleVolumeBreakdown());
    await waitFor(() => expect(result.current.status).toBe('error'));
  });
});
