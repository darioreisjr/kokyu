'use client';

import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useMemo } from 'react';

import { EmptyState, KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { getGoalAreaDefinition } from '../../constants/goalAreas';
import { goalRoutes } from '../../constants/goalRoutes';
import { useGoals } from '../../hooks/useGoals';
import { useGoalsProgressMap } from '../../hooks/useGoalsProgressMap';
import type { Goal } from '../../types';
import { GoalCard } from '../GoalCard/GoalCard';

const ACTIVE_STATUSES: Goal['status'][] = ['notStarted', 'onTrack', 'attention', 'atRisk'];

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <Stack
      spacing={0.5}
      sx={(theme) => ({
        flex: '1 1 140px',
        padding: 2,
        borderRadius: 2,
        border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        backgroundColor: themePalette(theme).kokyu.surface.primary,
      })}
    >
      <Typography variant="displaySmall" component="p">
        {value}
      </Typography>
      <Typography
        variant="body2"
        sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
      >
        {label}
      </Typography>
    </Stack>
  );
}

/** `/app/metas` — resumo do que importa (em andamento, no ritmo, atenção, concluídas no período), foco atual e como as metas se distribuem entre áreas. Nunca um painel cheio de métricas decorativas. */
export function GoalsOverviewPage() {
  const { status, goals } = useGoals();
  const { progressByGoalId } = useGoalsProgressMap(goals);

  const currentYear = new Date().getFullYear();

  const counts = useMemo(() => {
    const inProgress = goals.filter((goal) => ACTIVE_STATUSES.includes(goal.status)).length;
    const onTrack = goals.filter((goal) => goal.status === 'onTrack').length;
    const needsAttention = goals.filter(
      (goal) => goal.status === 'attention' || goal.status === 'atRisk',
    ).length;
    const completedThisYear = goals.filter(
      (goal) => goal.completedAt && new Date(goal.completedAt).getFullYear() === currentYear,
    ).length;
    return { inProgress, onTrack, needsAttention, completedThisYear };
  }, [goals, currentYear]);

  const focusGoals = useMemo(
    () =>
      goals
        .filter((goal) => goal.priority === 'focus' && ACTIVE_STATUSES.includes(goal.status))
        .slice(0, 3),
    [goals],
  );

  const areaBreakdown = useMemo(() => {
    const relevant = goals.filter((goal) => goal.status !== 'archived');
    const total = relevant.length;
    const counted = new Map<string, number>();
    for (const goal of relevant) counted.set(goal.area, (counted.get(goal.area) ?? 0) + 1);
    return Array.from(counted.entries())
      .map(([area, count]) => ({
        area: getGoalAreaDefinition(area as Goal['area']),
        count,
        percent: total === 0 ? 0 : Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [goals]);

  return (
    <Stack spacing={4}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' } }}
      >
        <Stack spacing={0.5}>
          <Typography variant="displaySmall" component="h1">
            Metas
          </Typography>
          <Typography
            variant="body1"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Acompanhe onde você quer chegar e como cada parte da sua rotina contribui para isso.
          </Typography>
        </Stack>
        <KokyuButton
          component={NextLink}
          href={goalRoutes.new}
          variant="contained"
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          Nova meta
        </KokyuButton>
      </Stack>

      {status === 'loading' ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: 2,
          }}
        >
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={92} />
          ))}
        </Box>
      ) : null}
      {status === 'error' ? (
        <Alert severity="error">Não foi possível carregar suas metas agora. Tente novamente.</Alert>
      ) : null}

      {status === 'ready' && goals.length === 0 ? (
        <EmptyState
          icon={TrackChangesRoundedIcon}
          title="Você ainda não definiu nenhuma meta."
          action={
            <KokyuButton component={NextLink} href={goalRoutes.new} variant="contained">
              Criar primeira meta
            </KokyuButton>
          }
        />
      ) : null}

      {status === 'ready' && goals.length > 0 ? (
        <>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
            <StatTile label="Em andamento" value={counts.inProgress} />
            <StatTile label="No ritmo" value={counts.onTrack} />
            <StatTile label="Precisam de atenção" value={counts.needsAttention} />
            <StatTile label={`Concluídas em ${currentYear}`} value={counts.completedThisYear} />
          </Stack>

          {focusGoals.length > 0 ? (
            <Stack spacing={2}>
              <Typography variant="labelLarge">Foco atual</Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                  gap: 2,
                }}
              >
                {focusGoals.map((goal) => {
                  const progress = progressByGoalId[goal.id];
                  return progress ? (
                    <GoalCard key={goal.id} goal={goal} progress={progress} />
                  ) : null;
                })}
              </Box>
            </Stack>
          ) : null}

          {areaBreakdown.length > 1 ? (
            <Stack spacing={1.5}>
              <Typography variant="labelLarge">Áreas das suas metas</Typography>
              <Typography
                variant="body2"
                sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
              >
                Como suas metas se distribuem — não é uma nota sobre sua vida, só um retrato de onde
                sua atenção está hoje.
              </Typography>
              <Stack spacing={1.25}>
                {areaBreakdown.map(({ area, count, percent }) => (
                  <Stack key={area.id} spacing={0.5}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                      <Typography variant="body2">{area.label}</Typography>
                      <Typography
                        variant="body2"
                        sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                      >
                        {count} · {percent}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={percent}
                      aria-label={`${area.label}: ${count} metas, ${percent}% do total`}
                      sx={(theme) => ({
                        borderRadius: 999,
                        backgroundColor: themePalette(theme).kokyu.background.subtle,
                      })}
                    />
                  </Stack>
                ))}
              </Stack>
            </Stack>
          ) : null}
        </>
      ) : null}
    </Stack>
  );
}
