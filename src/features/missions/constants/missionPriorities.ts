import type { MissionImportance, MissionPriority } from '../types';

export interface MissionPriorityDefinition {
  id: MissionPriority;
  label: string;
  /** MUI palette key — used together with an icon/label so priority is never color-only (WCAG). */
  color: 'default' | 'info' | 'warning' | 'error';
}

export const missionPriorityDefinitions: MissionPriorityDefinition[] = [
  { id: 'none', label: 'Sem prioridade', color: 'default' },
  { id: 'low', label: 'Baixa', color: 'default' },
  { id: 'medium', label: 'Média', color: 'info' },
  { id: 'high', label: 'Alta', color: 'warning' },
  { id: 'critical', label: 'Urgente', color: 'error' },
];

export function getMissionPriorityDefinition(priority: MissionPriority): MissionPriorityDefinition {
  return missionPriorityDefinitions.find((definition) => definition.id === priority) ?? missionPriorityDefinitions[0]!;
}

export function getMissionPriorityLabel(priority: MissionPriority): string {
  return getMissionPriorityDefinition(priority).label;
}

export const missionImportanceLabels: Record<MissionImportance, string> = {
  low: 'Não importante',
  high: 'Importante',
};
