'use client';

import { useCallback } from 'react';
import { missionService } from '../../services/missionService';
import { MissionListPage } from '../MissionListPage/MissionListPage';

export function CompletedMissionsPage() {
  const loadMissions = useCallback(
    async () => (await missionService.getMissions()).filter((m) => m.status === 'completed'),
    [],
  );

  return (
    <MissionListPage
      title="Concluídas"
      loadMissions={loadMissions}
      defaultSort={{ field: 'updatedAt', direction: 'desc' }}
      emptyMessage="Suas missões concluídas aparecerão aqui."
    />
  );
}
