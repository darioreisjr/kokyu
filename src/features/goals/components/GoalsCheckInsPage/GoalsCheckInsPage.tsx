'use client';

import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useState } from 'react';

import { EmptyState, KokyuButton } from '@/design-system/components';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';

import type { CheckInFormValues } from '../../schemas/checkInSchema';
import { goalService } from '../../services/goalService';
import type { Goal } from '../../types';
import { GoalCheckInDialog } from '../GoalCheckInDialog/GoalCheckInDialog';

type LoadStatus = 'loading' | 'ready' | 'error';

/** `/app/metas/check-ins` — metas que precisam de revisão, mais atrasadas primeiro. */
export function GoalsCheckInsPage() {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [pending, setPending] = useState<{ goal: Goal; daysOverdue: number }[]>([]);
  const [checkInGoal, setCheckInGoal] = useState<Goal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess } = useSnackbar();

  const load = useCallback(() => {
    setStatus('loading');
    goalService
      .getPendingCheckIns()
      .then((result) => {
        setPending(result);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  async function handleSaveCheckIn(values: CheckInFormValues) {
    if (!checkInGoal) return;
    setIsSubmitting(true);
    try {
      await goalService.createCheckIn(checkInGoal.id, values);
      showSuccess('Check-in registrado.');
      setCheckInGoal(null);
      load();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="displaySmall" component="h1">
          Check-ins
        </Typography>
        <Typography
          variant="body1"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          Metas que valem uma revisão rápida — as mais atrasadas primeiro.
        </Typography>
      </Stack>

      {status === 'loading' ? (
        <Stack spacing={1.5}>
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={72} />
          ))}
        </Stack>
      ) : null}
      {status === 'error' ? (
        <Alert severity="error">
          Não foi possível carregar os check-ins agora. Tente novamente.
        </Alert>
      ) : null}

      {status === 'ready' && pending.length === 0 ? (
        <EmptyState icon={EventAvailableRoundedIcon} title="Nenhuma meta precisa de revisão." />
      ) : null}

      {status === 'ready' && pending.length > 0 ? (
        <Stack spacing={1.5}>
          {pending.map(({ goal, daysOverdue }) => (
            <Stack
              key={goal.id}
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={(theme) => ({
                padding: 2,
                borderRadius: 2,
                border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
                backgroundColor: themePalette(theme).kokyu.surface.primary,
                justifyContent: 'space-between',
                alignItems: { sm: 'center' },
              })}
            >
              <Stack spacing={0.25}>
                <Typography variant="labelLarge">{goal.title}</Typography>
                <Typography
                  variant="body2"
                  sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                >
                  {daysOverdue > 0
                    ? `Revisão atrasada há ${daysOverdue} dias`
                    : 'Revisão disponível'}
                </Typography>
              </Stack>
              <KokyuButton
                variant="outlined"
                onClick={() => setCheckInGoal(goal)}
                sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
              >
                Fazer check-in
              </KokyuButton>
            </Stack>
          ))}
        </Stack>
      ) : null}

      <GoalCheckInDialog
        open={Boolean(checkInGoal)}
        goalTitle={checkInGoal?.title}
        onClose={() => setCheckInGoal(null)}
        onSave={handleSaveCheckIn}
        isSubmitting={isSubmitting}
      />
    </Stack>
  );
}
