import { beforeEach, describe, expect, it } from 'vitest';
import { resetMissionDb } from '@/features/missions/services/missionMockDb';
import { missionService } from '@/features/missions/services/missionService';
import { todayKey } from '@/features/missions/utils/missionDateKey';
import { missionCandidateProvider } from './candidateProviders';

describe('missionCandidateProvider', () => {
  beforeEach(() => {
    resetMissionDb();
  });

  it('does not suggest a non-splittable 90-minute mission for a 30-minute slot', async () => {
    const today = todayKey();
    await missionService.scheduleMission('mission-domain', today); // 30 min, no startAt yet
    await missionService.updateMission('mission-auth', { plannedDate: today, splittable: false, estimatedDuration: 90 });

    const candidates = await missionCandidateProvider.getCandidatesForSlot(30, today);
    expect(candidates.some((c) => c.sourceId === 'mission-auth')).toBe(false);
  });

  it('suggests a mission that fits the available slot', async () => {
    const today = todayKey();
    await missionService.scheduleMission('mission-domain', today);

    const candidates = await missionCandidateProvider.getCandidatesForSlot(30, today);
    expect(candidates.some((c) => c.sourceId === 'mission-domain')).toBe(true);
  });

  it('suggests a splittable mission even when longer than the slot', async () => {
    const today = todayKey();
    await missionService.updateMission('mission-auth', { plannedDate: today, splittable: true, minimumChunkDuration: 30 });

    const candidates = await missionCandidateProvider.getCandidatesForSlot(30, today);
    expect(candidates.some((c) => c.sourceId === 'mission-auth')).toBe(true);
  });
});
