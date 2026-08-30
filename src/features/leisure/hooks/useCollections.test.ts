import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { resetLeisureDb } from '../services/leisureMockDb';
import { useCollections } from './useCollections';

describe('useCollections', () => {
  beforeEach(() => {
    resetLeisureDb();
  });

  it('loads every collection', async () => {
    const { result } = renderHook(() => useCollections());
    expect(result.current.status).toBe('loading');

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.collections.length).toBeGreaterThan(0);
  });
});
