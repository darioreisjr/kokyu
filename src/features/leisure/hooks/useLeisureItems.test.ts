import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { resetLeisureDb } from '../services/leisureMockDb';
import { useLeisureItems } from './useLeisureItems';

describe('useLeisureItems', () => {
  beforeEach(() => {
    resetLeisureDb();
  });

  it('loads every item', async () => {
    const { result } = renderHook(() => useLeisureItems());
    expect(result.current.status).toBe('loading');

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.items.length).toBeGreaterThan(0);
  });
});
