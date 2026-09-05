import type { MissionChecklistItem } from '../types';

export function createMockMissionChecklistItems(): MissionChecklistItem[] {
  return [
    { id: 'checklist-auth-1', missionId: 'mission-auth', text: 'Tela de login', completed: true, order: 0, createdAt: '2026-08-10T09:00:00Z', updatedAt: '2026-08-20T09:00:00Z' },
    { id: 'checklist-auth-2', missionId: 'mission-auth', text: 'Tela de cadastro', completed: true, order: 1, createdAt: '2026-08-10T09:00:00Z', updatedAt: '2026-08-22T09:00:00Z' },
    { id: 'checklist-auth-3', missionId: 'mission-auth', text: 'Recuperação de senha', completed: false, order: 2, createdAt: '2026-08-10T09:00:00Z', updatedAt: '2026-08-10T09:00:00Z' },
    { id: 'checklist-auth-4', missionId: 'mission-auth', text: 'Testes de autenticação', completed: false, order: 3, createdAt: '2026-08-10T09:00:00Z', updatedAt: '2026-08-10T09:00:00Z' },
  ];
}
