import type { MissionPriority } from './mission.types';

export interface MissionTemplate {
  id: string;
  name: string;
  titleTemplate: string;
  description?: string;
  defaultDuration?: number;
  tagIds?: string[];
  checklist?: string[];
  priority?: MissionPriority;
}

export interface MissionProjectTemplate {
  id: string;
  name: string;
  sectionNames: string[];
  missionTemplateIds: string[];
}
