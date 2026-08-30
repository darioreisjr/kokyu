import type { GoalNote } from '../types';

export function createMockGoalNotes(): GoalNote[] {
  return [
    {
      id: 'note-1',
      goalId: 'goal-build-app',
      text: 'Ideia: usar o mesmo Design System do Kokyu para o app pessoal, só trocando a paleta.',
      tags: ['ideia'],
      createdAt: '2026-06-20T08:00:00.000Z',
    },
  ];
}
