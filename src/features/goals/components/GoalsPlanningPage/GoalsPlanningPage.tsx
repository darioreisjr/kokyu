'use client';

import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useMemo } from 'react';

import { EmptyState } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { useGoals } from '../../hooks/useGoals';
import type { Goal } from '../../types';
import { getGoalHorizon, goalHorizonLabels, type GoalHorizon } from '../../utils/goalHorizon';
import { GoalTimelineRow } from '../GoalTimelineRow/GoalTimelineRow';

const HORIZON_ORDER: GoalHorizon[] = ['now', 'month', 'quarter', 'year', 'longTerm', 'noDeadline'];
const ACTIVE_STATUSES: Goal['status'][] = [
  'notStarted',
  'onTrack',
  'attention',
  'atRisk',
  'paused',
];

/** `/app/metas/planejamento` — metas agrupadas por horizonte (Agora/Este mês/Este trimestre/Este ano/Longo prazo), com uma timeline simplificada no desktop. */
export function GoalsPlanningPage() {
  const { status, goals } = useGoals();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const activeGoals = useMemo(
    () => goals.filter((goal) => ACTIVE_STATUSES.includes(goal.status)),
    [goals],
  );

  const groups = useMemo(() => {
    const map = new Map<GoalHorizon, Goal[]>();
    for (const goal of activeGoals) {
      const horizon = getGoalHorizon(goal);
      map.set(horizon, [...(map.get(horizon) ?? []), goal]);
    }
    return HORIZON_ORDER.map((horizon) => ({ horizon, goals: map.get(horizon) ?? [] })).filter(
      (group) => group.goals.length > 0,
    );
  }, [activeGoals]);

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="displaySmall" component="h1">
          Planejamento
        </Typography>
        <Typography
          variant="body1"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          Suas metas organizadas por horizonte de tempo.
        </Typography>
      </Stack>

      {status === 'loading' ? (
        <Stack spacing={2}>
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={80} />
          ))}
        </Stack>
      ) : null}
      {status === 'error' ? (
        <Alert severity="error">
          Não foi possível carregar o planejamento agora. Tente novamente.
        </Alert>
      ) : null}

      {status === 'ready' && activeGoals.length === 0 ? (
        <EmptyState
          icon={CalendarMonthRoundedIcon}
          title="Nenhuma meta ativa para planejar ainda."
        />
      ) : null}

      {status === 'ready' && groups.length > 0
        ? groups.map((group) => (
            <Stack key={group.horizon} spacing={1.5}>
              <Typography variant="labelLarge">{goalHorizonLabels[group.horizon]}</Typography>
              {isDesktop ? (
                <Stack
                  spacing={2}
                  sx={(theme) => ({
                    padding: 2,
                    borderRadius: 2,
                    border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
                    backgroundColor: themePalette(theme).kokyu.surface.primary,
                  })}
                >
                  {group.goals.map((goal) => (
                    <GoalTimelineRow key={goal.id} goal={goal} />
                  ))}
                </Stack>
              ) : (
                <Stack spacing={1}>
                  {group.goals.map((goal) => (
                    <Box
                      key={goal.id}
                      sx={(theme) => ({
                        padding: 1.5,
                        borderRadius: 2,
                        border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
                        backgroundColor: themePalette(theme).kokyu.surface.primary,
                      })}
                    >
                      <Typography variant="labelMedium">{goal.title}</Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Stack>
          ))
        : null}
    </Stack>
  );
}
