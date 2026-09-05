'use client';

import { useCallback, useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { EmptyState } from '@/design-system/components';
import { useMissionProjects } from '../../hooks/useMissionProjects';
import { countOpenBlockers } from '../../services/engines/missionDependencyEngine';
import { missionService } from '../../services/missionService';
import { missionDb } from '../../services/missionMockDb';
import type { Mission, MissionFilters as MissionFiltersValue, MissionGroupField, MissionSort } from '../../types';
import { MissionFiltersBar } from '../MissionFiltersBar/MissionFiltersBar';
import { MissionList } from '../MissionList/MissionList';

export interface MissionListPageProps {
  title: string;
  description?: string;
  loadMissions: () => Promise<Mission[]>;
  defaultSort?: MissionSort;
  defaultGroup?: MissionGroupField;
  showFilters?: boolean;
  emptyMessage: string;
}

/** Shared shell for Próximas/Backlog/Aguardando/Concluídas — each only differs in what it loads and how it defaults to sort/group. */
export function MissionListPage({
  title,
  description,
  loadMissions,
  defaultSort = { field: 'deadline', direction: 'asc' },
  defaultGroup = 'none',
  showFilters = true,
  emptyMessage,
}: MissionListPageProps) {
  const { projects } = useMissionProjects();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<MissionFiltersValue>({});
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = useCallback(() => {
    setIsLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadMissions().then((data) => {
      if (!cancelled) {
        setMissions(data);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [loadMissions, reloadKey]);

  async function handleToggleComplete(mission: Mission) {
    if (mission.status === 'completed') {
      await missionService.reopenMission(mission.id);
    } else {
      await missionService.completeMission(mission.id);
    }
    refresh();
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body1" color="text.secondary">
              {description}
            </Typography>
          )}
        </Stack>

        {showFilters && <MissionFiltersBar value={filters} onChange={setFilters} />}

        {isLoading ? (
          <Stack sx={{ alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Stack>
        ) : missions.length === 0 ? (
          <EmptyState title={emptyMessage} />
        ) : (
          <MissionList
            missions={missions}
            dependencies={missionDb.dependencies}
            filters={filters}
            sort={defaultSort}
            group={defaultGroup}
            getProjectName={(id) => projects.find((p) => p.id === id)?.name ?? ''}
            getSectionName={(id) => missionDb.sections.find((s) => s.id === id)?.name ?? ''}
            getBlockedByCount={(missionId) => countOpenBlockers(missionId, missionDb.dependencies, missionDb.missions)}
            onToggleComplete={handleToggleComplete}
            emptyMessage={emptyMessage}
          />
        )}
      </Stack>
    </Container>
  );
}
