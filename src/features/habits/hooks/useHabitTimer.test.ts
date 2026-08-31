import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useHabitTimer } from './useHabitTimer';

describe('useHabitTimer', () => {
  it('initializes in stopped state and starts timer correctly', () => {
    const { result } = renderHook(() => useHabitTimer());

    expect(result.current.isRunning).toBe(false);
    expect(result.current.isPaused).toBe(false);

    act(() => {
      result.current.start(25);
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.totalSeconds).toBe(25 * 60);

    act(() => {
      result.current.pause();
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.isPaused).toBe(true);

    act(() => {
      result.current.stop();
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.isPaused).toBe(false);
  });
});
