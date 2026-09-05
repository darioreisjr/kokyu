import { describe, expect, it } from 'vitest';
import type { Mission, MissionDependency } from '../../types';
import { getMissionSuggestions } from './missionSuggestionService';

function buildMission(overrides: Partial<Mission> = {}): Mission {
  return {
    id: 'mission-1',
    title: 'Mission',
    status: 'ready',
    priority: 'none',
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

describe('missionSuggestionService', () => {
  it('never returns a mission already planned for today (that already appears in Today directly)', () => {
    const missions = [buildMission({ id: 'a', priority: 'critical', plannedDate: '2026-09-05' })];
    const suggestions = getMissionSuggestions(missions, [], { today: '2026-09-05', focusGoalIds: [] });
    expect(suggestions).toHaveLength(0);
  });

  it('excludes missions not yet available', () => {
    const missions = [buildMission({ id: 'a', priority: 'high', availableFrom: '2026-09-10' })];
    const suggestions = getMissionSuggestions(missions, [], { today: '2026-09-05', focusGoalIds: [] });
    expect(suggestions).toHaveLength(0);
  });

  it('excludes blocked missions', () => {
    const missions = [buildMission({ id: 'a', priority: 'high' }), buildMission({ id: 'b', priority: 'high' })];
    const deps: MissionDependency[] = [{ id: 'd1', blockerMissionId: 'b', blockedMissionId: 'a', createdAt: '2026-09-01T00:00:00Z' }];
    const suggestions = getMissionSuggestions(missions, deps, { today: '2026-09-05', focusGoalIds: [] });
    expect(suggestions.map((s) => s.missionId)).not.toContain('a');
  });

  it('ranks an overdue-deadline mission above a low-priority one with no deadline', () => {
    const missions = [
      buildMission({ id: 'urgent', priority: 'low', deadline: '2026-09-01' }),
      buildMission({ id: 'chill', priority: 'low' }),
    ];
    const suggestions = getMissionSuggestions(missions, [], { today: '2026-09-05', focusGoalIds: [] });
    expect(suggestions[0]!.missionId).toBe('urgent');
  });

  it('boosts a mission contributing to a focus goal', () => {
    const missions = [
      buildMission({ id: 'goal-linked', priority: 'low', goalIds: ['goal-1'] }),
      buildMission({ id: 'unrelated', priority: 'low' }),
    ];
    const suggestions = getMissionSuggestions(missions, [], { today: '2026-09-05', focusGoalIds: ['goal-1'] });
    expect(suggestions[0]!.missionId).toBe('goal-linked');
  });

  it('never mutates input or marks anything as planned — it only returns candidates', () => {
    const mission = buildMission({ id: 'a', priority: 'high' });
    getMissionSuggestions([mission], [], { today: '2026-09-05', focusGoalIds: [] });
    expect(mission.plannedDate).toBeUndefined();
    expect(mission.status).toBe('ready');
  });
});
