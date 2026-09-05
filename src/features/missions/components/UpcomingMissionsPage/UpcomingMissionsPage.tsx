'use client';

import { useCallback } from 'react';
import { missionService } from '../../services/missionService';
import { MissionListPage } from '../MissionListPage/MissionListPage';

export function UpcomingMissionsPage() {
  const loadMissions = useCallback(() => missionService.getUpcomingMissions(), []);

  return (
    <MissionListPage
      title="Próximas"
      description="Missões planejadas ou com prazo nos próximos dias."
      loadMissions={loadMissions}
      defaultSort={{ field: 'deadline', direction: 'asc' }}
      defaultGroup="date"
      emptyMessage="Nenhuma missão futura planejada."
    />
  );
}
