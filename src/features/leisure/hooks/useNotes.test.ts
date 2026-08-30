import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { resetLeisureDb } from '../services/leisureMockDb';
import { useNotes } from './useNotes';

describe('useNotes', () => {
  beforeEach(() => {
    resetLeisureDb();
  });

  it('loads notes alongside every item', async () => {
    const { result } = renderHook(() => useNotes());
    expect(result.current.status).toBe('loading');

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.notes.length).toBeGreaterThan(0);
    expect(result.current.items.length).toBeGreaterThan(0);
  });
});
