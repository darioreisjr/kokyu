import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { resetLeisureDb } from '../services/leisureMockDb';
import { useLeisureToday } from './useLeisureToday';

describe('useLeisureToday', () => {
  beforeEach(() => {
    resetLeisureDb();
  });

  it('loads today\'s plan, in-progress items and a "para depois" preview', async () => {
    const { result } = renderHook(() => useLeisureToday(new Date()));
    expect(result.current.status).toBe('loading');

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.planEntries.length).toBeGreaterThan(0);
    expect(result.current.inProgressItems.every((item) => item.status === 'inProgress')).toBe(true);
    expect(result.current.laterItems.every((item) => item.type === 'unsorted')).toBe(true);
  });
});
