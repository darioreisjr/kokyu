import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useRestTimer } from './useRestTimer';

describe('useRestTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-29T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reports not resting when restEndAt is undefined', () => {
    const { result } = renderHook(() => useRestTimer(undefined));
    expect(result.current).toEqual({ remainingSeconds: 0, isResting: false });
  });

  it('computes remaining seconds from the absolute end timestamp, not an accumulator', () => {
    const restEndAt = new Date('2026-08-29T12:01:30.000Z').toISOString();
    const { result } = renderHook(() => useRestTimer(restEndAt));
    expect(result.current.isResting).toBe(true);
    expect(result.current.remainingSeconds).toBe(90);

    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(result.current.remainingSeconds).toBe(60);
  });

  it('never goes negative once the rest period has elapsed', () => {
    const restEndAt = new Date('2026-08-29T12:00:10.000Z').toISOString();
    const { result } = renderHook(() => useRestTimer(restEndAt));
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(result.current.remainingSeconds).toBe(0);
    expect(result.current.isResting).toBe(false);
  });

  it('resumes at the exact correct second after a simulated reload (remount with the same restEndAt)', () => {
    const restEndAt = new Date('2026-08-29T12:02:00.000Z').toISOString();
    const first = renderHook(() => useRestTimer(restEndAt));
    act(() => {
      vi.advanceTimersByTime(45_000); // 45s elapsed, "page" now reloads
    });
    first.unmount();

    const second = renderHook(() => useRestTimer(restEndAt));
    expect(second.result.current.remainingSeconds).toBe(75); // 120 - 45
  });
});
