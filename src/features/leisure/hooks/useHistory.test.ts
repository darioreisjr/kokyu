import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { resetLeisureDb } from '../services/leisureMockDb';
import { useHistory } from './useHistory';

describe('useHistory', () => {
  beforeEach(() => {
    resetLeisureDb();
  });

  it('loads the log alongside every item', async () => {
    const { result } = renderHook(() => useHistory());
    expect(result.current.status).toBe('loading');

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.logEntries.length).toBeGreaterThan(0);
    expect(result.current.items.length).toBeGreaterThan(0);
  });
});
