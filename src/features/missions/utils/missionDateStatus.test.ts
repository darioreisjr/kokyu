import { describe, expect, it } from 'vitest';
import type { Mission } from '../types';
import {
  computeMissionDerivedFlags,
  isMissionAvailable,
  isMissionOverdue,
  missionNeedsReview,
} from './missionDateStatus';

function buildMission(overrides: Partial<Mission> = {}): Mission {
  return {
    id: 'mission-1',
    title: 'Enviar relatório',
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

describe('missionDateStatus', () => {
  it('keeps availableFrom, plannedDate and deadline fully independent', () => {
    const mission = buildMission({
      availableFrom: '2026-09-10',
      plannedDate: '2026-09-12',
      deadline: '2026-09-15',
    });

    expect(isMissionAvailable(mission, '2026-09-09')).toBe(false);
    expect(isMissionAvailable(mission, '2026-09-10')).toBe(true);
    expect(isMissionOverdue(mission, '2026-09-14')).toBe(false);
    expect(isMissionOverdue(mission, '2026-09-16')).toBe(true);
  });

  it('only a passed deadline on a non-terminal mission is overdue', () => {
    const overdueOpen = buildMission({ deadline: '2026-09-01' });
    const overdueCompleted = buildMission({ deadline: '2026-09-01', status: 'completed', completedAt: '2026-09-01T10:00:00Z' });

    expect(isMissionOverdue(overdueOpen, '2026-09-05')).toBe(true);
    expect(isMissionOverdue(overdueCompleted, '2026-09-05')).toBe(false);
  });

  it('a mission with no deadline is never overdue', () => {
    expect(isMissionOverdue(buildMission(), '2026-12-31')).toBe(false);
  });

  it('a planned date in the past needs review but is not overdue', () => {
    const mission = buildMission({ plannedDate: '2026-09-01' });

    expect(missionNeedsReview(mission, '2026-09-05')).toBe(true);
    expect(isMissionOverdue(mission, '2026-09-05')).toBe(false);
  });

  it('computeMissionDerivedFlags composes all flags from context', () => {
    const mission = buildMission({ deadline: '2026-09-01', status: 'waiting' });
    const flags = computeMissionDerivedFlags(mission, {
      today: '2026-09-05',
      isBlockedByOpenDependency: true,
      isScheduledToday: false,
    });

    expect(flags.overdue).toBe(true);
    expect(flags.waiting).toBe(true);
    expect(flags.blocked).toBe(true);
  });
});
