import type { GoalPriority } from '../types';

export const goalPriorityLabels: Record<GoalPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  focus: 'Foco atual',
};

export const goalPriorityOptions: { id: GoalPriority; label: string }[] = (
  Object.keys(goalPriorityLabels) as GoalPriority[]
).map((id) => ({
  id,
  label: goalPriorityLabels[id],
}));

export function getGoalPriorityLabel(priority: GoalPriority): string {
  return goalPriorityLabels[priority];
}
