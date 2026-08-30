import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { muscleGroupOptions } from '../constants/muscleGroups';
import { recoveryEstimateService } from '../services/recoveryEstimateService';
import { resetTrainingDb } from '../services/trainingMockDb';
import { useRecoveryOverview } from './useRecoveryOverview';

describe('useRecoveryOverview', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads one recovery estimate per muscle group', async () => {
    const { result } = renderHook(() => useRecoveryOverview());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.estimates).toHaveLength(muscleGroupOptions.length);
    expect(
      result.current.estimates.every(
        (estimate) => typeof estimate.estimatedRecoveryPercent === 'number',
      ),
    ).toBe(true);
  });

  it('moves to the error status when the service rejects', async () => {
    vi.spyOn(recoveryEstimateService, 'getRecoveryOverview').mockRejectedValueOnce(
      new Error('boom'),
    );
    const { result } = renderHook(() => useRecoveryOverview());
    await waitFor(() => expect(result.current.status).toBe('error'));
  });

  it('reload() re-fetches from the service', async () => {
    const getOverviewSpy = vi.spyOn(recoveryEstimateService, 'getRecoveryOverview');
    const { result } = renderHook(() => useRecoveryOverview());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(getOverviewSpy).toHaveBeenCalledTimes(1);

    result.current.reload();
    await waitFor(() => expect(getOverviewSpy).toHaveBeenCalledTimes(2));
  });
});
