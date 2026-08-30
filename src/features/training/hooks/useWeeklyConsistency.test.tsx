import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

import { PreferencesProvider } from '@/features/settings';

import { trainingAnalyticsService } from '../services/trainingAnalyticsService';
import { resetTrainingDb } from '../services/trainingMockDb';
import { useWeeklyConsistency } from './useWeeklyConsistency';

function wrapper({ children }: { children: ReactNode }) {
  return <PreferencesProvider>{children}</PreferencesProvider>;
}

describe('useWeeklyConsistency', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads exactly the requested number of weeks, defaulting to 8', async () => {
    const { result } = renderHook(() => useWeeklyConsistency(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.weeks).toHaveLength(8);
  });

  it('respects a custom weeksCount', async () => {
    const { result } = renderHook(() => useWeeklyConsistency(4), { wrapper });
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.weeks).toHaveLength(4);
  });

  it('moves to the error status when the service rejects', async () => {
    vi.spyOn(trainingAnalyticsService, 'getWeeklyConsistency').mockRejectedValueOnce(
      new Error('boom'),
    );
    const { result } = renderHook(() => useWeeklyConsistency(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe('error'));
  });
});
