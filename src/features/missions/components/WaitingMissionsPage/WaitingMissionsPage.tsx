'use client';

import { useCallback } from 'react';
import { missionService } from '../../services/missionService';
import { MissionListPage } from '../MissionListPage/MissionListPage';

export function WaitingMissionsPage() {
  const loadMissions = useCallback(() => missionService.getWaitingMissions(), []);

  return (
    <MissionListPage
      title="Aguardando"
      description="Missões que dependem de uma resposta, aprovação ou entrega externa."
      loadMissions={loadMissions}
      defaultSort={{ field: 'updatedAt', direction: 'desc' }}
      showFilters={false}
      emptyMessage="Nada aguardando retorno."
    />
  );
}
