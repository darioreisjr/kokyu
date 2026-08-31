import { describe, expect, it } from 'vitest';
import type { FocusSession, ScheduleEntry } from '../types';
import { scheduleAnalyticsService } from './scheduleAnalyticsService';

function createEntry(partial: Partial<ScheduleEntry>): ScheduleEntry {
  return {
    id: 'test-1',
    sourceType: 'mission',
    sourceId: 'm-1',
    title: 'Test',
    date: '2026-08-31',
    duration: 60,
    status: 'completed',
    createdAt: '2026-08-31T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z',
    ...partial,
  };
}

describe('scheduleAnalyticsService', () => {
  it('calculates planned vs actual and distribution by source accurately', () => {
    const entries: ScheduleEntry[] = [
      createEntry({ id: '1', sourceType: 'training', duration: 60, context: 'health' }),
      createEntry({ id: '2', sourceType: 'mission', duration: 120, context: 'work' }),
      createEntry({ id: '3', sourceType: 'leisure', duration: 60, context: 'leisure' }),
    ];

    const focusHistory: FocusSession[] = [
      {
        id: 'f-1',
        sourceType: 'mission',
        sourceId: 'm-1',
        title: 'Foco 1',
        startedAt: '2026-08-31T10:00:00Z',
        plannedDuration: 30,
        actualDurationSeconds: 1800, // 30 min
        mode: 'countdown',
        status: 'completed',
        accumulatedPausedSeconds: 0,
        createdAt: '2026-08-31T10:00:00Z',
        updatedAt: '2026-08-31T10:30:00Z',
      },
    ];

    const analytics = scheduleAnalyticsService.calculateAnalytics(entries, focusHistory);

    expect(analytics.timeBySource).toHaveLength(3);
    const missionSource = analytics.timeBySource.find((s) => s.sourceType === 'mission');
    expect(missionSource?.minutes).toBe(120);
    expect(missionSource?.percentage).toBe(50); // 120 / 240 = 50%

    expect(analytics.focus.totalSessions).toBe(1);
    expect(analytics.focus.totalDurationMinutes).toBe(30);
    expect(analytics.focus.completedSessions).toBe(1);
  });
});

