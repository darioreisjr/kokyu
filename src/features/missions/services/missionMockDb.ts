import { defaultMissionContexts } from '../constants/missionContexts';
import {
  createMockMissionActivity,
  createMockMissionChecklistItems,
  createMockMissionDependencies,
  createMockMissionProjects,
  createMockMissionSections,
  createMockMissionTags,
  createMockMissions,
  createMockSavedMissionViews,
} from '../mocks';
import type {
  Mission,
  MissionActivity,
  MissionChecklistItem,
  MissionContext,
  MissionDependency,
  MissionProject,
  MissionSection,
  MissionTag,
  SavedMissionView,
} from '../types';

export const missionDb: {
  missions: Mission[];
  projects: MissionProject[];
  sections: MissionSection[];
  dependencies: MissionDependency[];
  checklistItems: MissionChecklistItem[];
  activity: MissionActivity[];
  savedViews: SavedMissionView[];
  contexts: MissionContext[];
  tags: MissionTag[];
} = {
  missions: createMockMissions(),
  projects: createMockMissionProjects(),
  sections: createMockMissionSections(),
  dependencies: createMockMissionDependencies(),
  checklistItems: createMockMissionChecklistItems(),
  activity: createMockMissionActivity(),
  savedViews: createMockSavedMissionViews(),
  contexts: [...defaultMissionContexts],
  tags: createMockMissionTags(),
};

let idCounter = 1;

export function generateId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

export function resetMissionDb(): void {
  missionDb.missions = createMockMissions();
  missionDb.projects = createMockMissionProjects();
  missionDb.sections = createMockMissionSections();
  missionDb.dependencies = createMockMissionDependencies();
  missionDb.checklistItems = createMockMissionChecklistItems();
  missionDb.activity = createMockMissionActivity();
  missionDb.savedViews = createMockSavedMissionViews();
  missionDb.contexts = [...defaultMissionContexts];
  missionDb.tags = createMockMissionTags();
}
