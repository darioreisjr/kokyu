import type { GoalActivity } from '../types';

export function createMockGoalActivities(): GoalActivity[] {
  return [
    {
      id: 'activity-1',
      goalId: 'goal-read-20-books',
      type: 'created',
      description: 'Meta criada.',
      createdAt: '2026-01-02T10:00:00.000Z',
    },
    {
      id: 'activity-2',
      goalId: 'goal-read-20-books',
      type: 'checkIn',
      description: 'Check-in registrado: no ritmo.',
      createdAt: '2026-08-20T12:00:00.000Z',
    },
    {
      id: 'activity-3',
      goalId: 'goal-build-app',
      type: 'milestoneCompleted',
      description: 'Marco concluído: Definir o MVP.',
      createdAt: '2026-04-01T00:00:00.000Z',
    },
    {
      id: 'activity-4',
      goalId: 'goal-build-app',
      type: 'milestoneCompleted',
      description: 'Marco concluído: Finalizar autenticação.',
      createdAt: '2026-06-15T00:00:00.000Z',
    },
    {
      id: 'activity-5',
      goalId: 'goal-half-marathon',
      type: 'paused',
      description: 'Meta pausada.',
      createdAt: '2026-07-10T08:00:00.000Z',
    },
    {
      id: 'activity-6',
      goalId: 'goal-learn-guitar-basics',
      type: 'completed',
      description: 'Meta concluída.',
      createdAt: '2026-05-20T08:00:00.000Z',
    },
    {
      id: 'activity-7',
      goalId: 'goal-learn-french',
      type: 'abandoned',
      description: 'Meta encerrada: não faz mais sentido.',
      createdAt: '2026-04-20T08:00:00.000Z',
    },
  ];
}
