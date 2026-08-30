import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { goalService } from '../services/goalService';
import { useGoal } from './useGoal';

describe('useGoal', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads a goal by id', async () => {
    const { result } = renderHook(() => useGoal('goal-read-20-books'));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.goal?.title).toBe('Ler 20 livros este ano');
  });

  it('resolves with a null goal for an id that does not exist', async () => {
    const { result } = renderHook(() => useGoal('goal-does-not-exist'));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.goal).toBeNull();
  });

  it('moves to the error status when the service rejects', async () => {
    vi.spyOn(goalService, 'getGoal').mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useGoal('goal-read-20-books'));
    await waitFor(() => expect(result.current.status).toBe('error'));
  });
});
