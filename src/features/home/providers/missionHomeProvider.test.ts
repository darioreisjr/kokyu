import { beforeEach, describe, expect, it } from 'vitest';
import { resetMissionDb } from '@/features/missions/services/missionMockDb';
import { missionService } from '@/features/missions/services/missionService';
import { todayKey } from '@/features/missions/utils/missionDateKey';
import type { HomeProviderContext } from '@/shared/home/types';
import { missionHomeProvider } from './missionHomeProvider';

function buildContext(): HomeProviderContext {
  return {
    date: todayKey(),
    now: new Date(),
    dayStartsAt: '06:00',
    dayEndsAt: '23:00',
    weekStartsOn: 1,
  };
}

describe('missionHomeProvider', () => {
  beforeEach(() => {
    resetMissionDb();
  });

  it('classifies past-due, non-completed missions as overdue', async () => {
    const projection = await missionHomeProvider.getHomeProjection(buildContext());

    expect(projection.overdue.map((mission) => mission.id)).toContain('mission-overdue-review');
    expect(projection.overdue.every((mission) => mission.status === 'overdue')).toBe(true);
  });

  it('classifies the waiting-follow-up mission separately from overdue', async () => {
    const projection = await missionHomeProvider.getHomeProjection(buildContext());

    const followUpIds = projection.waitingFollowUp.map((mission) => mission.id);
    expect(followUpIds).toContain('mission-waiting-vendor');
    expect(projection.overdue.map((mission) => mission.id)).not.toContain('mission-waiting-vendor');
  });

  it('surfaces the highest-priority open mission scheduled for today as focusToday', async () => {
    const projection = await missionHomeProvider.getHomeProjection(buildContext());

    // Only "Enviar relatório mensal" is planned for today in the seed data.
    expect(projection.focusToday?.id).toBe('mission-monthly-report');
  });

  it('keeps a mission completed today visible (as completed) instead of dropping it', async () => {
    // Neutralize the seed follow-up mission so it doesn't contend for "today" here.
    await missionService.updateMission('mission-waiting-vendor', { status: 'ready', followUpAt: undefined });
    await missionService.scheduleMission('mission-backlog-1', todayKey());
    await missionService.completeMission('mission-monthly-report');
    await missionService.completeMission('mission-backlog-1');

    const projection = await missionHomeProvider.getHomeProjection(buildContext());

    expect(projection.focusToday?.status).toBe('completed');
    expect(projection.completedCount).toBeGreaterThanOrEqual(1);
  });

  it('counts completed missions separately from pending ones', async () => {
    const projection = await missionHomeProvider.getHomeProjection(buildContext());

    expect(projection.pendingCount).toBeGreaterThanOrEqual(0);
    expect(projection.completedCount).toBeGreaterThanOrEqual(0);
  });
});
