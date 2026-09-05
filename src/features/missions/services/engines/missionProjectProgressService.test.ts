import { describe, expect, it } from 'vitest';
import type { Mission } from '../../types';
import { calculateProjectProgress } from './missionProjectProgressService';

function buildMission(overrides: Partial<Mission> = {}): Mission {
  return {
    id: 'mission-1',
    title: 'Mission',
    status: 'ready',
    priority: 'medium',
    projectId: 'project-1',
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

describe('missionProjectProgressService', () => {
  it('computes completed/eligible ignoring cancelled and archived missions', () => {
    const missions = [
      buildMission({ id: 'a', status: 'completed' }),
      buildMission({ id: 'b', status: 'ready' }),
      buildMission({ id: 'c', status: 'cancelled' }),
      buildMission({ id: 'd', status: 'archived' }),
      buildMission({ id: 'e', projectId: 'other-project', status: 'completed' }),
    ];

    expect(calculateProjectProgress('project-1', missions)).toEqual({ completedCount: 1, eligibleCount: 2, percent: 50 });
  });

  it('returns 0% for a project with no eligible missions', () => {
    expect(calculateProjectProgress('empty-project', [])).toEqual({ completedCount: 0, eligibleCount: 0, percent: 0 });
  });
});
