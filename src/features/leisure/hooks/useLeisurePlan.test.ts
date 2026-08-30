import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { resetLeisureDb } from '../services/leisureMockDb';
import { getWeekDays, getWeekStart } from '../utils/dateHelpers';
import { useLeisurePlan } from './useLeisurePlan';

describe('useLeisurePlan', () => {
  beforeEach(() => {
    resetLeisureDb();
  });

  it('loads a week worth of plan entries and every item', async () => {
    const weekDays = getWeekDays(getWeekStart(new Date(), 1), 1);
    const { result } = renderHook(() => useLeisurePlan(weekDays));
    expect(result.current.status).toBe('loading');

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.items.length).toBeGreaterThan(0);
  });

  it('stays loading for an empty week', () => {
    const { result } = renderHook(() => useLeisurePlan([]));
    expect(result.current.status).toBe('loading');
    expect(result.current.planEntries).toHaveLength(0);
  });
});
