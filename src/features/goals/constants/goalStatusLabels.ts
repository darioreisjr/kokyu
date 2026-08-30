import type { GoalStatus } from '../types';

/** Never punitive language — "precisa de atenção", not "você falhou" (see the spec's own "NÃO PUNIR"). */
export const goalStatusLabels: Record<GoalStatus, string> = {
  notStarted: 'Não iniciada',
  onTrack: 'No ritmo',
  attention: 'Atenção',
  atRisk: 'Em risco',
  completed: 'Concluída',
  paused: 'Pausada',
  abandoned: 'Encerrada',
  archived: 'Arquivada',
};

export function getGoalStatusLabel(status: GoalStatus): string {
  return goalStatusLabels[status];
}
