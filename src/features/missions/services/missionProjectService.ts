import type { Mission, MissionProject, MissionProjectProgress, MissionSection } from '../types';
import { calculateProjectProgress } from './engines/missionProjectProgressService';
import { getProjectNextAction } from './engines/projectNextActionService';
import { generateId, missionDb } from './missionMockDb';
import { missionService } from './missionService';

export type MissionProjectInput = Omit<
  MissionProject,
  'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'archivedAt' | 'status' | 'goalIds' | 'tags' | 'progressStrategy'
> &
  Partial<Pick<MissionProject, 'status' | 'goalIds' | 'tags' | 'progressStrategy'>>;

function nowIso(): string {
  return new Date().toISOString();
}

/** What to do with a project's still-open missions when it's marked complete — the caller always asks first (spec "PROJECT COMPLETE"). */
export type OpenMissionsOnCompleteAction = 'moveToBacklog' | 'cancel' | 'keep';

export const missionProjectService = {
  async getProjects(): Promise<MissionProject[]> {
    return [...missionDb.projects];
  },

  async getProject(id: string): Promise<MissionProject | null> {
    const project = missionDb.projects.find((p) => p.id === id);
    return project ? { ...project } : null;
  },

  async createProject(input: MissionProjectInput): Promise<MissionProject> {
    const now = nowIso();
    const project: MissionProject = {
      ...input,
      id: generateId('project'),
      status: input.status ?? 'draft',
      goalIds: input.goalIds ?? [],
      tags: input.tags ?? [],
      progressStrategy: input.progressStrategy ?? 'completionRatio',
      createdAt: now,
      updatedAt: now,
    };
    missionDb.projects.push(project);
    return { ...project };
  },

  async updateProject(id: string, patch: Partial<MissionProjectInput>): Promise<MissionProject | null> {
    const index = missionDb.projects.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const updated: MissionProject = { ...missionDb.projects[index]!, ...patch, updatedAt: nowIso() };
    missionDb.projects[index] = updated;
    return { ...updated };
  },

  async completeProject(id: string, openMissionsAction: OpenMissionsOnCompleteAction = 'keep'): Promise<MissionProject | null> {
    const index = missionDb.projects.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const openMissions = missionDb.missions.filter(
      (m) => m.projectId === id && m.status !== 'completed' && m.status !== 'cancelled' && m.status !== 'archived',
    );

    if (openMissionsAction === 'moveToBacklog') {
      for (const mission of openMissions) {
        await missionService.updateMission(mission.id, { status: 'ready', plannedDate: undefined });
      }
    } else if (openMissionsAction === 'cancel') {
      for (const mission of openMissions) {
        await missionService.cancelMission(mission.id);
      }
    }

    const now = nowIso();
    const updated: MissionProject = { ...missionDb.projects[index]!, status: 'completed', completedAt: now, updatedAt: now };
    missionDb.projects[index] = updated;
    return { ...updated };
  },

  async archiveProject(id: string): Promise<MissionProject | null> {
    const index = missionDb.projects.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const now = nowIso();
    const updated: MissionProject = { ...missionDb.projects[index]!, status: 'archived', archivedAt: now, updatedAt: now };
    missionDb.projects[index] = updated;
    return { ...updated };
  },

  async deleteProject(id: string): Promise<void> {
    missionDb.projects = missionDb.projects.filter((p) => p.id !== id);
    missionDb.sections = missionDb.sections.filter((s) => s.projectId !== id);
  },

  // ----------------------------------------------------
  // SECTIONS
  // ----------------------------------------------------

  async getSections(projectId: string): Promise<MissionSection[]> {
    return missionDb.sections
      .filter((s) => s.projectId === projectId)
      .sort((a, b) => a.order - b.order);
  },

  async createSection(projectId: string, name: string): Promise<MissionSection> {
    const now = nowIso();
    const existing = await missionProjectService.getSections(projectId);
    const section: MissionSection = {
      id: generateId('section'),
      projectId,
      name,
      order: existing.length,
      createdAt: now,
      updatedAt: now,
    };
    missionDb.sections.push(section);
    return { ...section };
  },

  async updateSection(id: string, patch: Partial<Pick<MissionSection, 'name' | 'order'>>): Promise<MissionSection | null> {
    const index = missionDb.sections.findIndex((s) => s.id === id);
    if (index === -1) return null;
    const updated: MissionSection = { ...missionDb.sections[index]!, ...patch, updatedAt: nowIso() };
    missionDb.sections[index] = updated;
    return { ...updated };
  },

  async deleteSection(id: string): Promise<void> {
    missionDb.sections = missionDb.sections.filter((s) => s.id !== id);
    missionDb.missions = missionDb.missions.map((m) => (m.sectionId === id ? { ...m, sectionId: undefined } : m));
  },

  // ----------------------------------------------------
  // DERIVED
  // ----------------------------------------------------

  async getProjectMissions(projectId: string): Promise<Mission[]> {
    return missionDb.missions.filter((m) => m.projectId === projectId).map((m) => ({ ...m }));
  },

  async getProjectProgress(projectId: string): Promise<MissionProjectProgress> {
    return calculateProjectProgress(projectId, missionDb.missions);
  },

  async getProjectNextAction(projectId: string): Promise<Mission | null> {
    return getProjectNextAction(projectId, missionDb.missions, missionDb.dependencies);
  },
};
