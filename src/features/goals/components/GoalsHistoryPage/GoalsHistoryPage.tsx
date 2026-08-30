'use client';

import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';

import { EmptyState } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { useGoals } from '../../hooks/useGoals';
import { goalService } from '../../services/goalService';
import type { Goal, GoalActivity } from '../../types';
import { formatShortDateTime } from '../../utils/dateHelpers';

type LoadStatus = 'loading' | 'ready' | 'error';
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** `/app/metas/historico` — uma revisão de período (não julgadora) seguida da timeline completa de mudanças. */
export function GoalsHistoryPage() {
  const { goals } = useGoals();
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [activities, setActivities] = useState<GoalActivity[]>([]);
  const goalTitleById = useMemo(
    () => new Map(goals.map((goal) => [goal.id, goal.title] as const)),
    [goals],
  );

  useEffect(() => {
    goalService
      .getAllActivities()
      .then((result) => {
        setActivities(result);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  const review = useMemo(() => {
    const now = new Date().getTime();
    const isWithin = (isoDate: string | undefined, days: number) =>
      Boolean(isoDate) && now - new Date(isoDate!).getTime() <= days * MS_PER_DAY;
    const advanced = goals.filter((goal: Goal) => isWithin(goal.lastProgressAt, 30)).length;
    const completed = goals.filter((goal) => isWithin(goal.completedAt, 30)).length;
    const atRisk = goals.filter((goal) => goal.status === 'atRisk').length;
    const upcomingMilestones = goals
      .flatMap((goal) =>
        (goal.milestones ?? [])
          .filter((milestone) => !milestone.completed && milestone.targetDate)
          .map((milestone) => ({ goal, milestone })),
      )
      .filter(
        ({ milestone }) => (new Date(milestone.targetDate!).getTime() - now) / MS_PER_DAY <= 14,
      )
      .slice(0, 5);
    return { advanced, completed, atRisk, upcomingMilestones };
  }, [goals]);

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="displaySmall" component="h1">
          Histórico
        </Typography>
        <Typography
          variant="body1"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          O que avançou, o que precisa de atenção e tudo que mudou nas suas metas.
        </Typography>
      </Stack>

      {goals.length > 0 ? (
        <Stack
          spacing={1.5}
          sx={(theme) => ({
            padding: 2,
            borderRadius: 2,
            border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
            backgroundColor: themePalette(theme).kokyu.surface.primary,
          })}
        >
          <Typography variant="labelLarge">Revisão dos últimos 30 dias</Typography>
          <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
            <Typography variant="body2">{review.advanced} metas avançaram</Typography>
            <Typography variant="body2">{review.completed} metas concluídas</Typography>
            <Typography variant="body2">{review.atRisk} metas em risco agora</Typography>
          </Stack>
          {review.upcomingMilestones.length > 0 ? (
            <Stack spacing={0.5}>
              <Typography variant="labelMedium">Próximos marcos</Typography>
              {review.upcomingMilestones.map(({ goal, milestone }) => (
                <Typography
                  key={milestone.id}
                  variant="body2"
                  sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                >
                  {milestone.title} — {goal.title}
                </Typography>
              ))}
            </Stack>
          ) : null}
        </Stack>
      ) : null}

      {status === 'loading' ? (
        <Stack spacing={1}>
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={48} />
          ))}
        </Stack>
      ) : null}
      {status === 'error' ? (
        <Alert severity="error">
          Não foi possível carregar o histórico agora. Tente novamente.
        </Alert>
      ) : null}
      {status === 'ready' && activities.length === 0 ? (
        <EmptyState icon={HistoryRoundedIcon} title="Nenhuma mudança registrada ainda." />
      ) : null}

      {status === 'ready' && activities.length > 0 ? (
        <Stack
          spacing={1}
          sx={(theme) => ({
            borderLeft: `2px solid ${themePalette(theme).kokyu.border.subtle}`,
            paddingLeft: 2,
          })}
        >
          {activities.map((activity) => (
            <Stack key={activity.id} spacing={0.1}>
              <Typography variant="body2">
                {goalTitleById.get(activity.goalId) ?? 'Meta'} — {activity.description}
              </Typography>
              <Typography
                variant="labelSmall"
                sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
              >
                {formatShortDateTime(activity.createdAt)}
              </Typography>
            </Stack>
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}
