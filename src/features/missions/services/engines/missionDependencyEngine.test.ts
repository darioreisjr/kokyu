import { describe, expect, it } from 'vitest';
import type { Mission, MissionDependency } from '../../types';
import {
  countOpenBlockers,
  getMissionsUnblockedBy,
  isMissionBlocked,
  validateNewDependency,
  wouldCreateCycle,
} from './missionDependencyEngine';

function dep(blockerMissionId: string, blockedMissionId: string): MissionDependency {
  return { id: `${blockerMissionId}->${blockedMissionId}`, blockerMissionId, blockedMissionId, createdAt: '2026-09-01T00:00:00Z' };
}

function buildMission(id: string, status: Mission['status']): Mission {
  return {
    id,
    title: id,
    status,
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
  };
}

describe('missionDependencyEngine', () => {
  it('a mission blocked by an open blocker is blocked', () => {
    const deps = [dep('a', 'b')];
    expect(isMissionBlocked('b', deps, { a: 'ready', b: 'ready' })).toBe(true);
  });

  it('a mission is unblocked once its blocker is completed/cancelled/archived', () => {
    const deps = [dep('a', 'b')];
    expect(isMissionBlocked('b', deps, { a: 'completed', b: 'ready' })).toBe(false);
    expect(isMissionBlocked('b', deps, { a: 'cancelled', b: 'ready' })).toBe(false);
  });

  it('rejects a self-referencing dependency', () => {
    expect(validateNewDependency('a', 'a', []).valid).toBe(false);
    expect(validateNewDependency('a', 'a', []).error).toBe('selfReference');
  });

  it('rejects a duplicate dependency', () => {
    const deps = [dep('a', 'b')];
    const result = validateNewDependency('a', 'b', deps);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('duplicate');
  });

  it('detects a direct cycle (A blocks B, B would block A)', () => {
    const deps = [dep('a', 'b')];
    expect(wouldCreateCycle('b', 'a', deps)).toBe(true);
  });

  it('detects a transitive cycle (A->B->C, C would block A)', () => {
    const deps = [dep('a', 'b'), dep('b', 'c')];
    expect(wouldCreateCycle('c', 'a', deps)).toBe(true);
    expect(validateNewDependency('c', 'a', deps).error).toBe('cycle');
  });

  it('allows a valid, non-cyclical dependency', () => {
    const deps = [dep('a', 'b')];
    expect(wouldCreateCycle('a', 'c', deps)).toBe(false);
    expect(validateNewDependency('a', 'c', deps).valid).toBe(true);
  });

  it('countOpenBlockers only counts still-open blockers', () => {
    const deps = [dep('a', 'c'), dep('b', 'c')];
    const missions = [buildMission('a', 'completed'), buildMission('b', 'ready'), buildMission('c', 'ready')];
    expect(countOpenBlockers('c', deps, missions)).toBe(1);
  });

  it('getMissionsUnblockedBy reports missions freed once the blocker completes', () => {
    const deps = [dep('a', 'b'), dep('a', 'c')];
    const missions = [buildMission('a', 'ready'), buildMission('b', 'ready'), buildMission('c', 'ready')];
    expect(getMissionsUnblockedBy('a', deps, missions).sort()).toEqual(['b', 'c']);
  });
});
