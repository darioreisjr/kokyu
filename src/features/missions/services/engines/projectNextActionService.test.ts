import { describe, expect, it } from 'vitest';
import type { Mission, MissionDependency } from '../../types';
import { getProjectNextAction } from './projectNextActionService';

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

describe('projectNextActionService', () => {
  it('picks the ready/planned mission with the earliest deadline', () => {
    const missions = [
      buildMission({ id: 'a', deadline: '2026-09-10' }),
      buildMission({ id: 'b', deadline: '2026-09-05' }),
      buildMission({ id: 'c' }),
    ];
    expect(getProjectNextAction('project-1', missions, [])?.id).toBe('b');
  });

  it('never returns a blocked mission', () => {
    const missions = [buildMission({ id: 'a', deadline: '2026-09-01' }), buildMission({ id: 'b' })];
    const deps: MissionDependency[] = [{ id: 'd1', blockerMissionId: 'b', blockedMissionId: 'a', createdAt: '2026-09-01T00:00:00Z' }];
    expect(getProjectNextAction('project-1', missions, deps)?.id).toBe('b');
  });

  it('returns null when there are no eligible candidates', () => {
    const missions = [buildMission({ status: 'waiting' })];
    expect(getProjectNextAction('project-1', missions, [])).toBeNull();
  });

  it('falls back to priority, then creation order, when no deadlines exist', () => {
    const missions = [
      buildMission({ id: 'a', priority: 'low', createdAt: '2026-09-01T00:00:00Z' }),
      buildMission({ id: 'b', priority: 'critical', createdAt: '2026-09-02T00:00:00Z' }),
    ];
    expect(getProjectNextAction('project-1', missions, [])?.id).toBe('b');
  });
});
