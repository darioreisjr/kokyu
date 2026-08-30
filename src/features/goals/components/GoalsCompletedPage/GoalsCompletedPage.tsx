'use client';

import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';

import { EmptyState } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { getGoalAreaLabel } from '../../constants/goalAreas';
import { useGoals } from '../../hooks/useGoals';
import { goalService } from '../../services/goalService';
import type { GoalReflection } from '../../types';
import { formatShortDateTime } from '../../utils/dateHelpers';
import { GoalAreaIcon } from '../GoalAreaIcon/GoalAreaIcon';

/** `/app/metas/concluidas` — o que foi alcançado, quando, e a reflexão registrada ao concluir (quando houver). */
export function GoalsCompletedPage() {
  const { status, goals } = useGoals();
  const [reflectionsByGoalId, setReflectionsByGoalId] = useState<Record<string, GoalReflection[]>>(
    {},
  );

  const completedGoals = useMemo(
    () =>
      goals
        .filter((goal) => goal.status === 'completed')
        .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? '')),
    [goals],
  );

  useEffect(() => {
    if (completedGoals.length === 0) return;
    let cancelled = false;
    Promise.all(
      completedGoals.map(
        async (goal) => [goal.id, await goalService.getGoalReflections(goal.id)] as const,
      ),
    ).then((entries) => {
      if (!cancelled) setReflectionsByGoalId(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
  }, [completedGoals]);

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="displaySmall" component="h1">
          Concluídas
        </Typography>
        <Typography
          variant="body1"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          Suas metas concluídas aparecerão aqui.
        </Typography>
      </Stack>

      {status === 'loading' ? (
        <Stack spacing={1.5}>
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={96} />
          ))}
        </Stack>
      ) : null}
      {status === 'error' ? (
        <Alert severity="error">
          Não foi possível carregar suas metas concluídas agora. Tente novamente.
        </Alert>
      ) : null}

      {status === 'ready' && completedGoals.length === 0 ? (
        <EmptyState icon={EmojiEventsRoundedIcon} title="Suas metas concluídas aparecerão aqui." />
      ) : null}

      {status === 'ready' && completedGoals.length > 0 ? (
        <Stack spacing={1.5}>
          {completedGoals.map((goal) => {
            const durationDays = goal.completedAt
              ? Math.round(
                  (new Date(goal.completedAt).getTime() - new Date(goal.startDate).getTime()) /
                    (24 * 60 * 60 * 1000),
                )
              : null;
            const reflection = reflectionsByGoalId[goal.id]?.[0];
            return (
              <Stack
                key={goal.id}
                spacing={1}
                sx={(theme) => ({
                  padding: 2,
                  borderRadius: 2,
                  border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
                  backgroundColor: themePalette(theme).kokyu.surface.primary,
                })}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <GoalAreaIcon
                    area={goal.area}
                    fontSize="small"
                    sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                  />
                  <Typography variant="labelLarge">{goal.title}</Typography>
                </Stack>
                <Typography
                  variant="body2"
                  sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                >
                  {getGoalAreaLabel(goal.area)} · Concluída em{' '}
                  {goal.completedAt ? formatShortDateTime(goal.completedAt) : '—'}
                  {durationDays !== null ? ` · ${durationDays} dias` : ''}
                </Typography>
                {reflection ? (
                  <Stack
                    spacing={0.5}
                    sx={(theme) => ({
                      paddingTop: 0.5,
                      borderTop: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
                    })}
                  >
                    {reflection.whatWorked ? (
                      <Typography variant="body2">
                        O que funcionou: {reflection.whatWorked}
                      </Typography>
                    ) : null}
                    {reflection.whatLearned ? (
                      <Typography variant="body2">
                        O que aprendeu: {reflection.whatLearned}
                      </Typography>
                    ) : null}
                    {reflection.whatWouldChangeNextTime ? (
                      <Typography variant="body2">
                        Faria diferente: {reflection.whatWouldChangeNextTime}
                      </Typography>
                    ) : null}
                  </Stack>
                ) : null}
              </Stack>
            );
          })}
        </Stack>
      ) : null}
    </Stack>
  );
}
