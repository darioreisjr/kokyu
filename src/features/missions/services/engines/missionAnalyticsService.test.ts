import { describe, expect, it } from 'vitest';
import { MISSION_ANALYTICS_MIN_SAMPLE_SIZE } from '../../constants/missionAnalyticsConstants';
import type { Mission, MissionProject } from '../../types';
import { getMissionAnalyticsOverview } from './missionAnalyticsService';

function buildMission(overrides: Partial<Mission> = {}): Mission {
  return {
    id: 'mission-1',
    title: 'Mission',
    status: 'ready',
    priority: 'medium',
    contextIds: [],
    tagIds: [],
    goalIds: [],
    scheduleEntryIds: [],
    reminderIds: [],
    progressMode: 'binary',
    source: 'manual',
    replanCount: 0,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    ...overrides,
  };
}

describe('missionAnalyticsService', () => {
  it('counts completed/pending/overdue without any aggregate score', () => {
    const missions = [
      buildMission({ id: 'a', status: 'completed' }),
      buildMission({ id: 'b', status: 'ready' }),
      buildMission({ id: 'c', deadline: '2026-09-01' }),
    ];
    const overview = getMissionAnalyticsOverview(missions, [], '2026-09-05');

    expect(overview.completedCount).toBe(1);
    expect(overview.pendingCount).toBe(2);
    expect(overview.overdueCount).toBe(1);
    expect(overview).not.toHaveProperty('productivityScore');
  });

  it('omits estimationAccuracy below the minimum sample size', () => {
    const missions = Array.from({ length: MISSION_ANALYTICS_MIN_SAMPLE_SIZE - 1 }, (_, i) =>
      buildMission({ id: `m-${i}`, estimatedDuration: 30, actualDurationMinutes: 40 }),
    );
    const overview = getMissionAnalyticsOverview(missions, [], '2026-09-05');
    expect(overview.estimationAccuracy).toBeUndefined();
  });

  it('computes estimationAccuracy once the sample size threshold is met', () => {
    const missions = Array.from({ length: MISSION_ANALYTICS_MIN_SAMPLE_SIZE }, (_, i) =>
      buildMission({ id: `m-${i}`, estimatedDuration: 30, actualDurationMinutes: 40 }),
    );
    const overview = getMissionAnalyticsOverview(missions, [], '2026-09-05');
    expect(overview.estimationAccuracy).toEqual({ averageEstimatedMinutes: 30, averageActualMinutes: 40, sampleSize: MISSION_ANALYTICS_MIN_SAMPLE_SIZE });
  });

  it('counts only active projects', () => {
    const projects: MissionProject[] = [
      { id: 'p1', name: 'A', status: 'active', goalIds: [], progressStrategy: 'completionRatio', tags: [], createdAt: '', updatedAt: '' },
      { id: 'p2', name: 'B', status: 'paused', goalIds: [], progressStrategy: 'completionRatio', tags: [], createdAt: '', updatedAt: '' },
    ];
    expect(getMissionAnalyticsOverview([], projects, '2026-09-05').activeProjectCount).toBe(1);
  });
});
