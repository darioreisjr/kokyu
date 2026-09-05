import { beforeEach, describe, expect, it } from 'vitest';
import { resetMissionDb } from './missionMockDb';
import { missionProjectService } from './missionProjectService';
import { missionService } from './missionService';

describe('missionProjectService', () => {
  beforeEach(() => {
    resetMissionDb();
  });

  it('computes project progress from real mission statuses', async () => {
    const progress = await missionProjectService.getProjectProgress('project-portfolio');
    expect(progress.eligibleCount).toBeGreaterThan(0);
    expect(progress.percent).toBeGreaterThanOrEqual(0);
    expect(progress.percent).toBeLessThanOrEqual(100);
  });

  it('completing a project with open missions and action "cancel" cancels them, not silently', async () => {
    await missionProjectService.completeProject('project-portfolio', 'cancel');

    const missions = await missionProjectService.getProjectMissions('project-portfolio');
    const stillOpen = missions.filter((m) => m.status !== 'completed' && m.status !== 'cancelled' && m.status !== 'archived');
    expect(stillOpen).toHaveLength(0);
  });

  it('completing a project with action "moveToBacklog" clears plannedDate on open missions instead of cancelling', async () => {
    await missionService.updateMission('mission-auth', { plannedDate: '2026-12-01' });
    await missionProjectService.completeProject('project-portfolio', 'moveToBacklog');

    const mission = await missionService.getMission('mission-auth');
    expect(mission?.status).toBe('ready');
    expect(mission?.plannedDate).toBeUndefined();
  });

  it('completing a project with action "keep" leaves open missions untouched', async () => {
    await missionProjectService.completeProject('project-portfolio', 'keep');
    const mission = await missionService.getMission('mission-auth');
    expect(mission?.status).toBe('ready');
  });

  it('creates and reorders sections', async () => {
    const section = await missionProjectService.createSection('project-portfolio', 'Nova seção');
    const sections = await missionProjectService.getSections('project-portfolio');
    expect(sections.at(-1)?.id).toBe(section.id);
  });
});
