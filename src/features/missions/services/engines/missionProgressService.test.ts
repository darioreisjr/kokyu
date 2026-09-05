import { describe, expect, it } from 'vitest';
import type { Mission, MissionChecklistItem } from '../../types';
import { calculateChecklistProgress, calculateMissionProgress, calculateSubmissionsProgress } from './missionProgressService';

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

function buildChecklistItem(overrides: Partial<MissionChecklistItem>): MissionChecklistItem {
  return {
    id: 'item-1',
    missionId: 'mission-1',
    text: 'step',
    completed: false,
    order: 0,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    ...overrides,
  };
}

describe('missionProgressService', () => {
  it('checklist progress is derived, never stored', () => {
    const items = [
      buildChecklistItem({ id: 'a', completed: true }),
      buildChecklistItem({ id: 'b', completed: true }),
      buildChecklistItem({ id: 'c', completed: false }),
    ];
    expect(calculateChecklistProgress(items)).toEqual({ completed: 2, total: 3, percent: 67 });
  });

  it('submissions progress ignores cancelled/archived children', () => {
    const parent = buildMission({ id: 'parent', progressMode: 'submissions' });
    const missions = [
      parent,
      buildMission({ id: 'sub-1', parentMissionId: 'parent', status: 'completed' }),
      buildMission({ id: 'sub-2', parentMissionId: 'parent', status: 'ready' }),
      buildMission({ id: 'sub-3', parentMissionId: 'parent', status: 'cancelled' }),
    ];
    expect(calculateSubmissionsProgress('parent', missions)).toEqual({ completed: 1, total: 2, percent: 50 });
  });

  it('binary progress mode reflects only the mission its own status', () => {
    const mission = buildMission({ status: 'completed' });
    expect(calculateMissionProgress(mission, [mission], [])).toEqual({ completed: 1, total: 1, percent: 100 });
  });

  it('calculateMissionProgress dispatches by progressMode', () => {
    const parent = buildMission({ id: 'parent', progressMode: 'checklist' });
    const items = [buildChecklistItem({ id: 'a', completed: true }), buildChecklistItem({ id: 'b', completed: false })];
    expect(calculateMissionProgress(parent, [parent], items)).toEqual({ completed: 1, total: 2, percent: 50 });
  });
});
