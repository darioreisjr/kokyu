import type { MissionTag } from '../types';

export function createMockMissionTags(): MissionTag[] {
  return [
    { id: 'tag-dev', label: 'dev' },
    { id: 'tag-portfolio', label: 'portfolio' },
    { id: 'tag-urgente', label: 'urgente' },
    { id: 'tag-financeiro', label: 'financeiro' },
  ];
}
