import type { MissionSection } from '../types';

export function createMockMissionSections(): MissionSection[] {
  return [
    { id: 'section-planning', projectId: 'project-portfolio', name: 'Planejamento', order: 0, createdAt: '2026-08-01T09:00:00Z', updatedAt: '2026-08-01T09:00:00Z' },
    { id: 'section-execution', projectId: 'project-portfolio', name: 'Execução', order: 1, createdAt: '2026-08-01T09:00:00Z', updatedAt: '2026-08-01T09:00:00Z' },
    { id: 'section-review', projectId: 'project-portfolio', name: 'Revisão', order: 2, createdAt: '2026-08-01T09:00:00Z', updatedAt: '2026-08-01T09:00:00Z' },
  ];
}
