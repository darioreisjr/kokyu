import type { MissionStatus } from '../types';

export const missionStatusLabels: Record<MissionStatus, string> = {
  inbox: 'Entrada',
  ready: 'Pronta',
  planned: 'Planejada',
  inProgress: 'Em andamento',
  waiting: 'Aguardando',
  blocked: 'Bloqueada',
  completed: 'Concluída',
  cancelled: 'Cancelada',
  archived: 'Arquivada',
};

export function getMissionStatusLabel(status: MissionStatus): string {
  return missionStatusLabels[status];
}
