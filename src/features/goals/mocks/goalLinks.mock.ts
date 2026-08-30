import type { GoalLink } from '../types';

/** Contribuições — relacionamentos com entidades de outros módulos, sempre com um `entityLabel` já resolvido (ver `goalLink.types.ts`). */
export function createMockGoalLinks(): GoalLink[] {
  return [
    {
      id: 'link-1',
      goalId: 'goal-publish-portfolio',
      entityType: 'mission',
      entityId: 'mission-create-design',
      entityLabel: 'Criar design do portfólio',
      relationshipType: 'contributesTo',
      completed: true,
      createdAt: '2026-05-02T08:00:00.000Z',
    },
    {
      id: 'link-2',
      goalId: 'goal-publish-portfolio',
      entityType: 'mission',
      entityId: 'mission-write-about',
      entityLabel: 'Escrever a página Sobre',
      relationshipType: 'contributesTo',
      completed: false,
      createdAt: '2026-05-10T08:00:00.000Z',
    },
    {
      id: 'link-3',
      goalId: 'goal-train-4x-week',
      entityType: 'habit',
      entityId: 'habit-morning-workout',
      entityLabel: 'Treinar pela manhã',
      relationshipType: 'supports',
      completed: false,
      createdAt: '2026-07-01T08:00:00.000Z',
    },
  ];
}
