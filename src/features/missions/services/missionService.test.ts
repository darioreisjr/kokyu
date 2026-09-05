import { beforeEach, describe, expect, it } from 'vitest';
import { resetMissionDb, missionDb } from './missionMockDb';
import { missionService } from './missionService';
import { todayKey } from '../utils/missionDateKey';

describe('missionService', () => {
  beforeEach(() => {
    resetMissionDb();
  });

  it('creates a mission with only a title landing in inbox', async () => {
    const mission = await missionService.createMission({ title: 'Comprar ingresso' });
    expect(mission.status).toBe('inbox');
    expect(mission.priority).toBe('none');
  });

  it('creates a mission with a project/deadline already in ready, skipping inbox', async () => {
    const mission = await missionService.createMission({ title: 'Configurar CI', projectId: 'project-portfolio' });
    expect(mission.status).toBe('ready');
  });

  it('completing a mission records a completed event and sets completedAt', async () => {
    const mission = await missionService.completeMission('mission-backlog-1');
    expect(mission?.status).toBe('completed');
    expect(mission?.completedAt).toBeDefined();

    const activity = await missionService.getMissionActivity('mission-backlog-1');
    expect(activity.some((a) => a.type === 'completed')).toBe(true);
  });

  it('reopening a completed mission preserves the completed activity entry and adds a reopened one', async () => {
    await missionService.completeMission('mission-backlog-1');
    await missionService.reopenMission('mission-backlog-1');

    const activity = await missionService.getMissionActivity('mission-backlog-1');
    expect(activity.some((a) => a.type === 'completed')).toBe(true);
    expect(activity.some((a) => a.type === 'reopened')).toBe(true);

    const mission = await missionService.getMission('mission-backlog-1');
    expect(mission?.status).toBe('ready');
    expect(mission?.completedAt).toBeUndefined();
  });

  it('completing a recurring mission generates the next occurrence without overwriting the completed one', async () => {
    const before = await missionService.getMissions();
    const seriesId = before.find((m) => m.id === 'mission-monthly-report')!.recurrenceSeriesId!;

    await missionService.completeMission('mission-monthly-report');

    const after = await missionService.getMissions();
    const seriesMissions = after.filter((m) => m.recurrenceSeriesId === seriesId);
    expect(seriesMissions).toHaveLength(2);
    expect(seriesMissions.find((m) => m.id === 'mission-monthly-report')?.status).toBe('completed');
    expect(seriesMissions.some((m) => m.id !== 'mission-monthly-report' && m.status === 'ready')).toBe(true);
  });

  it('rescheduling a mission (via scheduleMission) never touches its deadline', async () => {
    const before = await missionService.getMission('mission-domain');
    await missionService.scheduleMission('mission-domain', '2026-12-25', '09:00');
    const after = await missionService.getMission('mission-domain');

    expect(after?.plannedDate).toBe('2026-12-25');
    expect(after?.deadline).toBe(before?.deadline);
  });

  it('rescheduling an already-planned mission increments replanCount', async () => {
    await missionService.scheduleMission('mission-domain', '2026-12-01');
    const first = await missionService.getMission('mission-domain');
    await missionService.scheduleMission('mission-domain', '2026-12-05');
    const second = await missionService.getMission('mission-domain');

    expect(second!.replanCount).toBe(first!.replanCount + 1);
  });

  it('removing a schedule (unscheduleMission) keeps the mission but clears plannedDate/scheduledStartAt', async () => {
    await missionService.scheduleMission('mission-domain', todayKey(), '10:00');
    await missionService.unscheduleMission('mission-domain');
    const mission = await missionService.getMission('mission-domain');

    expect(mission).not.toBeNull();
    expect(mission?.plannedDate).toBeUndefined();
    expect(mission?.scheduledStartAt).toBeUndefined();
  });

  it('adding a dependency rejects a cycle', async () => {
    await missionService.addMissionDependency('mission-monthly-report', 'mission-backlog-1');
    await expect(missionService.addMissionDependency('mission-backlog-1', 'mission-monthly-report')).rejects.toThrow();
  });

  it('a mission blocked by an open dependency is reported via getMissionDependencies', async () => {
    const info = await missionService.getMissionDependencies('mission-domain');
    expect(info.isBlocked).toBe(true);
    expect(info.blockedBy).toContain('mission-auth');
  });

  it('completing the blocker leaves the dependent unblocked (never auto-completed)', async () => {
    await missionService.completeMission('mission-auth');
    const info = await missionService.getMissionDependencies('mission-domain');
    expect(info.isBlocked).toBe(false);

    const dependent = await missionService.getMission('mission-domain');
    expect(dependent?.status).not.toBe('completed');
  });

  it('getTodayMissions never includes yesterday-incomplete missions automatically', async () => {
    await missionService.updateMission('mission-backlog-1', { plannedDate: '2000-01-01' });
    const today = await missionService.getTodayMissions();
    expect(today.some((m) => m.id === 'mission-backlog-1')).toBe(false);
  });

  it('getMissionSuggestions never mutates status or plannedDate', async () => {
    await missionService.getMissionSuggestions();
    const mission = await missionService.getMission('mission-overdue-review');
    expect(mission?.plannedDate).toBeUndefined();
  });

  it('bulkUpdateMissions applies the same patch to every id', async () => {
    const updated = await missionService.bulkUpdateMissions(['mission-inbox-1', 'mission-backlog-1'], { priority: 'high' });
    expect(updated.every((m) => m.priority === 'high')).toBe(true);
  });

  it('archiving a mission preserves its data and stamps archivedAt', async () => {
    const mission = await missionService.archiveMission('mission-backlog-1');
    expect(mission?.status).toBe('archived');
    expect(mission?.archivedAt).toBeDefined();
    expect(mission?.title).toBe('Estudar capítulo 4');
  });

  it('deleteMission removes the mission and its dependencies/checklist/activity', async () => {
    await missionService.deleteMission('mission-domain');
    expect(await missionService.getMission('mission-domain')).toBeNull();
    expect(missionDb.dependencies.some((d) => d.blockedMissionId === 'mission-domain')).toBe(false);
  });
});
