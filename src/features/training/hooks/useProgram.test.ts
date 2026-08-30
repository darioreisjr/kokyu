import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { programService } from '../services/programService';
import { resetTrainingDb } from '../services/trainingMockDb';
import { useProgram } from './useProgram';

describe('useProgram', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads a program by id', async () => {
    const { result } = renderHook(() => useProgram('program-hipertrofia-fundamentos'));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.program?.name).toBe('Hipertrofia — Fundamentos');
  });

  it('resolves with a null program for an id that does not exist', async () => {
    const { result } = renderHook(() => useProgram('program-does-not-exist'));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.program).toBeNull();
  });

  it('moves to the error status when the service rejects', async () => {
    vi.spyOn(programService, 'getProgram').mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useProgram('program-hipertrofia-fundamentos'));
    await waitFor(() => expect(result.current.status).toBe('error'));
  });

  it('reload() re-fetches from the service', async () => {
    const getProgramSpy = vi.spyOn(programService, 'getProgram');
    const { result } = renderHook(() => useProgram('program-hipertrofia-fundamentos'));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(getProgramSpy).toHaveBeenCalledTimes(1);

    result.current.reload();
    await waitFor(() => expect(getProgramSpy).toHaveBeenCalledTimes(2));
  });
});
