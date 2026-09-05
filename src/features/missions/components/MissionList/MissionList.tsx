'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { MissionDependency, MissionFilters, MissionGroupField, MissionSort } from '../../types';
import { applyMissionFilters, groupMissions, sortMissions } from '../../services/engines/missionFilterEngine';
import { todayKey } from '../../utils/missionDateKey';
import type { Mission } from '../../types';
import { MissionRow } from '../MissionRow/MissionRow';

export interface MissionListProps {
  missions: Mission[];
  dependencies: MissionDependency[];
  filters?: MissionFilters;
  sort?: MissionSort;
  group?: MissionGroupField;
  getProjectName: (id: string) => string;
  getSectionName: (id: string) => string;
  getBlockedByCount: (missionId: string) => number;
  onToggleComplete?: (mission: Mission) => void;
  emptyMessage?: string;
}

/**
 * The one place list filtering/sorting/grouping happens for a rendered list — always through
 * `missionFilterEngine`, never recomputed ad hoc per component (spec's explicit non-goal).
 */
export function MissionList({
  missions,
  dependencies,
  filters = {},
  sort = { field: 'manual', direction: 'asc' },
  group = 'none',
  getProjectName,
  getSectionName,
  getBlockedByCount,
  onToggleComplete,
  emptyMessage = 'Nenhuma missão encontrada.',
}: MissionListProps) {
  const filtered = applyMissionFilters(missions, filters, { today: todayKey(), dependencies });
  const sorted = sortMissions(filtered, sort);
  const groups = groupMissions(sorted, group, { getProjectName, getSectionName });

  if (sorted.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <Stack spacing={3}>
      {groups.map((groupItem) => (
        <Stack key={groupItem.key} spacing={1}>
          {group !== 'none' && (
            <Typography variant="subtitle2" color="text.secondary">
              {groupItem.label}
            </Typography>
          )}
          <Stack spacing={1}>
            {groupItem.missions.map((mission) => (
              <MissionRow
                key={mission.id}
                mission={mission}
                projectName={mission.projectId ? getProjectName(mission.projectId) : undefined}
                blockedByCount={getBlockedByCount(mission.id)}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
