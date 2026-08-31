import { beforeEach, describe, expect, it, vi } from 'vitest';
import { calculateElapsedSeconds, focusStorage } from './focusStorage';

describe('focusStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts session and persists in localStorage', () => {
    const session = focusStorage.startSession({
      sourceType: 'focus',
      sourceId: 'src-1',
      title: 'Deep Work',
      plannedDuration: 25,
      mode: 'countdown',
    });

    expect(session.id).toBeDefined();
    expect(session.status).toBe('active');

    const loaded = focusStorage.loadActiveSession();
    expect(loaded?.id).toBe(session.id);
  });

  it('calculates elapsed time without drift across pause/resume', () => {
    vi.useFakeTimers();
    const startTime = new Date('2026-08-31T10:00:00Z').getTime();
    vi.setSystemTime(startTime);

    const session = focusStorage.startSession({
      sourceType: 'focus',
      sourceId: 'src-2',
      title: 'Coding session',
      plannedDuration: 30,
      mode: 'countdown',
    });

    // Advance time 5 minutes (300 seconds)
    vi.setSystemTime(startTime + 300000);
    expect(calculateElapsedSeconds(session)).toBe(300);

    // Pause session
    const paused = focusStorage.pauseSession(session);
    expect(paused.status).toBe('paused');
    expect(paused.actualDurationSeconds).toBe(300);

    // Advance 10 minutes while paused
    vi.setSystemTime(startTime + 900000);
    expect(calculateElapsedSeconds(paused)).toBe(300);

    // Resume session
    const resumed = focusStorage.resumeSession(paused);
    expect(resumed.status).toBe('active');

    // Advance 2 minutes after resume
    vi.setSystemTime(startTime + 1020000);
    expect(calculateElapsedSeconds(resumed)).toBe(420); // 300 + 120

    vi.useRealTimers();
  });
});

