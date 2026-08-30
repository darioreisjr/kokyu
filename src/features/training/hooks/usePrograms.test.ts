import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { programService } from '../services/programService';
import { resetTrainingDb } from '../services/trainingMockDb';
import { usePrograms } from './usePrograms';

describe('usePrograms', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads the seeded program list', async () => {
    const { result } = renderHook(() => usePrograms());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.programs).toHaveLength(1);
    expect(result.current.programs[0]?.id).toBe('program-hipertrofia-fundamentos');
  });

  it('moves to the error status when the service rejects', async () => {
    vi.spyOn(programService, 'getPrograms').mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => usePrograms());
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.programs).toEqual([]);
  });

  it('reload() re-fetches from the service', async () => {
    const getProgramsSpy = vi.spyOn(programService, 'getPrograms');
    const { result } = renderHook(() => usePrograms());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(getProgramsSpy).toHaveBeenCalledTimes(1);

    result.current.reload();
    await waitFor(() => expect(getProgramsSpy).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.status).toBe('ready'));
  });
});
