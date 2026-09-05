'use client';

import { useCallback } from 'react';
import { missionService } from '../../services/missionService';
import { MissionListPage } from '../MissionListPage/MissionListPage';

/** Organized but with no temporal commitment yet — spec "BACKLOG" vs. "INBOX". */
export function BacklogMissionsPage() {
  const loadMissions = useCallback(() => missionService.getBacklog(), []);

  return (
    <MissionListPage
      title="Backlog"
      description="Missões válidas, sem data definida ainda."
      loadMissions={loadMissions}
      defaultSort={{ field: 'priority', direction: 'desc' }}
      defaultGroup="project"
      emptyMessage="Nenhuma missão aguardando planejamento."
    />
  );
}
