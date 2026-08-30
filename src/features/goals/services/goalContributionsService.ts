import type { Goal, GoalLinkEntityType } from '../types';
import { goalDb } from './goalMockDb';

export interface GoalContribution {
  entityType: GoalLinkEntityType;
  label: string;
  summary: string;
  linkCount: number;
}

const entityTypeLabels: Record<GoalLinkEntityType, string> = {
  mission: 'Missões',
  habit: 'Hábitos',
  training: 'Treinamento',
  nutrition: 'Nutrição',
  leisure: 'Tempo Livre',
  scheduleEntry: 'Ritmo Diário',
};

/**
 * "O que está contribuindo" — deliberately separate from `goalProgressEngine`: a module can
 * contribute to a goal (via `GoalLink`) without being its official progress source. Never used to
 * compute the goal's actual percent.
 */
export function getGoalContributions(goal: Goal): GoalContribution[] {
  const links = goalDb.links.filter((link) => link.goalId === goal.id);
  if (links.length === 0) return [];

  const groups = new Map<GoalLinkEntityType, { total: number; completed: number }>();
  for (const link of links) {
    const group = groups.get(link.entityType) ?? { total: 0, completed: 0 };
    group.total += 1;
    if (link.completed) group.completed += 1;
    groups.set(link.entityType, group);
  }

  return Array.from(groups.entries()).map(([entityType, { total, completed }]) => ({
    entityType,
    label: entityTypeLabels[entityType],
    summary: `${completed} de ${total} ações relacionadas concluídas`,
    linkCount: total,
  }));
}
