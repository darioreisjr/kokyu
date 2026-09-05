import type { MissionProject } from '../types';

export function createMockMissionProjects(): MissionProject[] {
  return [
    {
      id: 'project-portfolio',
      name: 'Lançar meu site',
      description: 'Publicar o portfólio pessoal com autenticação e domínio próprio.',
      status: 'active',
      areaId: 'work',
      goalIds: ['goal-launch-app'],
      startDate: '2026-08-01',
      targetDate: '2026-09-30',
      colorToken: 'schedule.source.mission',
      icon: 'AssignmentRounded',
      progressStrategy: 'completionRatio',
      tags: ['dev', 'portfolio'],
      createdAt: '2026-08-01T09:00:00Z',
      updatedAt: '2026-08-20T09:00:00Z',
    },
    {
      id: 'project-mudanca',
      name: 'Organizar mudança de casa',
      status: 'paused',
      areaId: 'personal',
      goalIds: [],
      progressStrategy: 'completionRatio',
      tags: [],
      createdAt: '2026-07-10T09:00:00Z',
      updatedAt: '2026-07-15T09:00:00Z',
    },
  ];
}
