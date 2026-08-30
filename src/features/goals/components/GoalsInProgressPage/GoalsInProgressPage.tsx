'use client';

import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useMemo, useState } from 'react';

import { EmptyState, KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { goalRoutes } from '../../constants/goalRoutes';
import { useGoals } from '../../hooks/useGoals';
import { useGoalsProgressMap } from '../../hooks/useGoalsProgressMap';
import type { Goal } from '../../types';
import {
  filterGoals,
  sortGoals,
  type GoalFilterOptions,
  type GoalSortOption,
} from '../../utils/goalFilters';
import { GoalCard } from '../GoalCard/GoalCard';
import { GoalFiltersBar, type GoalViewMode } from '../GoalFiltersBar/GoalFiltersBar';

const ACTIVE_STATUSES: Goal['status'][] = [
  'notStarted',
  'onTrack',
  'attention',
  'atRisk',
  'paused',
];

/** `/app/metas/em-andamento` — todas as metas ativas, com filtros, busca e ordenação. */
export function GoalsInProgressPage() {
  const { status, goals } = useGoals();
  const { progressByGoalId } = useGoalsProgressMap(goals);
  const [filters, setFilters] = useState<GoalFilterOptions>({});
  const [sortBy, setSortBy] = useState<GoalSortOption>('priority');
  const [viewMode, setViewMode] = useState<GoalViewMode>('cards');

  const activeGoals = useMemo(
    () => goals.filter((goal) => ACTIVE_STATUSES.includes(goal.status)),
    [goals],
  );

  const visibleGoals = useMemo(() => {
    const filtered = filterGoals(activeGoals, filters);
    const percentByGoalId = Object.fromEntries(
      Object.entries(progressByGoalId).map(([id, progress]) => [id, progress.percent]),
    );
    return sortGoals(filtered, sortBy, percentByGoalId);
  }, [activeGoals, filters, sortBy, progressByGoalId]);

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="displaySmall" component="h1">
          Em andamento
        </Typography>
        <Typography
          variant="body1"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          Todas as metas ativas — filtre por área, status, prioridade ou fonte.
        </Typography>
      </Stack>

      {status === 'ready' && activeGoals.length > 0 ? (
        <GoalFiltersBar
          filters={filters}
          onFiltersChange={setFilters}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      ) : null}

      {status === 'loading' ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={220} />
          ))}
        </Box>
      ) : null}
      {status === 'error' ? (
        <Alert severity="error">Não foi possível carregar suas metas agora. Tente novamente.</Alert>
      ) : null}

      {status === 'ready' && activeGoals.length === 0 ? (
        <EmptyState
          icon={TrackChangesRoundedIcon}
          title="Nenhuma meta está ativa agora."
          action={
            <KokyuButton component={NextLink} href={goalRoutes.new} variant="contained">
              Nova meta
            </KokyuButton>
          }
        />
      ) : null}

      {status === 'ready' && activeGoals.length > 0 ? (
        visibleGoals.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns:
                viewMode === 'cards'
                  ? { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }
                  : '1fr',
              gap: 2,
            }}
          >
            {visibleGoals.map((goal) => {
              const progress = progressByGoalId[goal.id];
              return progress ? <GoalCard key={goal.id} goal={goal} progress={progress} /> : null;
            })}
          </Box>
        ) : (
          <Typography
            variant="body2"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Nenhuma meta encontrada com esses filtros.
          </Typography>
        )
      ) : null}
    </Stack>
  );
}
