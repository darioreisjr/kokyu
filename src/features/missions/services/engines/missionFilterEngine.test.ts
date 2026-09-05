import { describe, expect, it } from 'vitest';
import type { Mission } from '../../types';
import { applyMissionFilters, groupMissions, sortMissions } from './missionFilterEngine';

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

describe('missionFilterEngine', () => {
  it('context filter only keeps missions with a matching contextId', () => {
    const missions = [
      buildMission({ id: 'a', contextIds: ['context-computer'] }),
      buildMission({ id: 'b', contextIds: ['context-home'] }),
    ];
    const result = applyMissionFilters(missions, { contextId: ['context-computer'] }, { today: '2026-09-05', dependencies: [] });
    expect(result.map((m) => m.id)).toEqual(['a']);
  });

  it('duration filter (durationMax) excludes missions above the threshold and those with no estimate', () => {
    const missions = [
      buildMission({ id: 'short', estimatedDuration: 15 }),
      buildMission({ id: 'long', estimatedDuration: 90 }),
      buildMission({ id: 'no-estimate' }),
    ];
    const result = applyMissionFilters(missions, { durationMax: 30 }, { today: '2026-09-05', dependencies: [] });
    expect(result.map((m) => m.id)).toEqual(['short']);
  });

  it('search matches title and description case-insensitively', () => {
    const missions = [buildMission({ id: 'a', title: 'Enviar Relatório' }), buildMission({ id: 'b', title: 'Comprar pão' })];
    const result = applyMissionFilters(missions, { search: 'relatório' }, { today: '2026-09-05', dependencies: [] });
    expect(result.map((m) => m.id)).toEqual(['a']);
  });

  it('blocked filter uses the dependency graph, not a persisted flag', () => {
    const missions = [buildMission({ id: 'a' }), buildMission({ id: 'b' })];
    const deps = [{ id: 'd1', blockerMissionId: 'b', blockedMissionId: 'a', createdAt: '2026-09-01T00:00:00Z' }];
    const result = applyMissionFilters(missions, { blocked: true }, { today: '2026-09-05', dependencies: deps });
    expect(result.map((m) => m.id)).toEqual(['a']);
  });

  it('sorts by priority, deadline, and title consistently', () => {
    const missions = [
      buildMission({ id: 'low', priority: 'low' }),
      buildMission({ id: 'critical', priority: 'critical' }),
      buildMission({ id: 'medium', priority: 'medium' }),
    ];
    const sorted = sortMissions(missions, { field: 'priority', direction: 'desc' });
    expect(sorted.map((m) => m.id)).toEqual(['critical', 'medium', 'low']);
  });

  it('groups by project with a stable "no project" bucket', () => {
    const missions = [buildMission({ id: 'a', projectId: 'p1' }), buildMission({ id: 'b' })];
    const groups = groupMissions(missions, 'project', { getProjectName: () => 'Projeto X', getSectionName: () => '' });
    expect(groups.map((g) => g.key).sort()).toEqual(['no-project', 'p1']);
  });
});
