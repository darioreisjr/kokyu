import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { goalService } from '../services/goalService';
import { useGoals } from './useGoals';

describe('useGoals', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('moves to the error status when the service rejects', async () => {
    vi.spyOn(goalService, 'getGoals').mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useGoals());
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.goals).toEqual([]);
  });

  it('reload() re-fetches from the service', async () => {
    const getGoalsSpy = vi.spyOn(goalService, 'getGoals');
    const { result } = renderHook(() => useGoals());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(getGoalsSpy).toHaveBeenCalledTimes(1);

    result.current.reload();
    await waitFor(() => expect(getGoalsSpy).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.status).toBe('ready'));
  });
});
