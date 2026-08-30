'use client';

import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { addDays } from 'date-fns';
import NextLink from 'next/link';
import { useMemo, useState } from 'react';

import { KokyuButton, EmptyState } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { cardTokens } from '@/design-system/tokens/component';

import { trainingRoutes } from '../../constants/trainingRoutes';
import { useExercises } from '../../hooks/useExercises';
import { useRoutines } from '../../hooks/useRoutines';
import { useScheduleEntries } from '../../hooks/useScheduleEntries';
import { useStartWorkout } from '../../hooks/useStartWorkout';
import { toDateKey } from '../../utils/dateHelpers';
import { formatDurationMinutes } from '../../utils/trainingFormatting';
import { ActiveSessionBanner } from '../ActiveSessionBanner/ActiveSessionBanner';
import { ActiveSessionConflictDialog } from '../ActiveSessionConflictDialog/ActiveSessionConflictDialog';
import { TrainingPreferencesDialog } from '../TrainingPreferencesDialog/TrainingPreferencesDialog';

export function TrainingTodayPage() {
  const [today] = useState(() => new Date());
  const todayKey = toDateKey(today);
  const range = useMemo(
    () => ({ from: todayKey, to: toDateKey(addDays(today, 14)) }),
    [today, todayKey],
  );
  const { status, entries } = useScheduleEntries(range);
  const { routines } = useRoutines();
  const { exercises } = useExercises();
  const startWorkout = useStartWorkout();
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  const routineById = useMemo(
    () => new Map(routines.map((routine) => [routine.id, routine] as const)),
    [routines],
  );
  const todaysEntries = entries.filter((entry) => entry.date === todayKey);
  // If more than one entry lands on today (e.g. the user planned something in addition to a
  // recurring program slot), a still-actionable `planned` one always wins over anything the user
  // already resolved (skipped/completed/rest) — never re-surface a workout as startable once it's
  // been explicitly skipped.
  const todayEntry = todaysEntries.find((entry) => entry.status === 'planned') ?? todaysEntries[0];
  const nextEntry = entries
    .filter((entry) => entry.date > todayKey && entry.status === 'planned')
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const todayRoutine = todayEntry?.routineId ? routineById.get(todayEntry.routineId) : undefined;

  return (
    <Stack spacing={3}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <Stack spacing={0.5}>
          <Typography variant="displaySmall" component="h1">
            Treinamento
          </Typography>
          <Typography
            variant="body1"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Planeje, registre e acompanhe sua evolução.
          </Typography>
        </Stack>
        <IconButton aria-label="Preferências de treino" onClick={() => setPreferencesOpen(true)}>
          <SettingsRoundedIcon />
        </IconButton>
      </Stack>

      <ActiveSessionBanner />

      {status === 'loading' ? (
        <Skeleton variant="rounded" height={140} />
      ) : todayEntry?.status === 'rest' ? (
        <Box
          sx={(theme) => ({
            borderRadius: cardTokens.radius,
            border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
            padding: 3,
          })}
        >
          <Typography variant="labelLarge">Hoje é dia de descanso.</Typography>
        </Box>
      ) : todayEntry?.status === 'completed' ? (
        <Box
          sx={(theme) => ({
            borderRadius: cardTokens.radius,
            border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
            padding: 3,
          })}
        >
          <Stack spacing={1}>
            <Typography variant="labelLarge">Treino concluído hoje — {todayEntry.label}</Typography>
            {todayEntry.sessionId ? (
              <KokyuButton
                variant="text"
                component={NextLink}
                href={trainingRoutes.session(todayEntry.sessionId)}
                sx={{ alignSelf: 'flex-start' }}
              >
                Ver resumo
              </KokyuButton>
            ) : null}
          </Stack>
        </Box>
      ) : todayEntry?.status === 'planned' && todayRoutine ? (
        <Box
          sx={(theme) => ({
            borderRadius: cardTokens.radius,
            border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
            padding: 3,
          })}
        >
          <Stack spacing={1.5}>
            <Typography
              variant="labelSmall"
              sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
            >
              Treino de hoje
            </Typography>
            <Typography variant="displaySmall" component="p">
              {todayRoutine.name}
            </Typography>
            <Typography
              variant="body2"
              sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
            >
              {todayRoutine.exercises.length} exercícios
              {todayRoutine.estimatedDurationMinutes
                ? ` · ${formatDurationMinutes(todayRoutine.estimatedDurationMinutes * 60)}`
                : ''}
              {todayEntry.time ? ` · ${todayEntry.time}` : ''}
            </Typography>
            <KokyuButton
              variant="contained"
              startIcon={<PlayArrowRoundedIcon />}
              onClick={() => startWorkout.requestStartRoutine(todayRoutine, exercises)}
              sx={{ alignSelf: 'flex-start' }}
            >
              Iniciar treino
            </KokyuButton>
          </Stack>
        </Box>
      ) : (
        <EmptyState
          title="Nenhum treino planejado para hoje."
          action={
            <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
              <KokyuButton variant="contained" component={NextLink} href={trainingRoutes.routines}>
                Escolher treino
              </KokyuButton>
              <KokyuButton
                variant="outlined"
                startIcon={<AddRoundedIcon />}
                component={NextLink}
                href={trainingRoutes.newRoutine}
              >
                Criar treino
              </KokyuButton>
              <KokyuButton variant="text" component={NextLink} href={trainingRoutes.calendar}>
                Planejar treino
              </KokyuButton>
            </Stack>
          }
        />
      )}

      {nextEntry ? (
        <Typography
          variant="body2"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          Próximo treino: {nextEntry.label} em{' '}
          {new Date(nextEntry.date).toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
          })}
          {nextEntry.time ? ` às ${nextEntry.time}` : ''}
        </Typography>
      ) : null}

      <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
        <KokyuButton
          variant="outlined"
          startIcon={<FitnessCenterRoundedIcon />}
          onClick={() => startWorkout.requestStartFree()}
        >
          Iniciar treino livre
        </KokyuButton>
        <KokyuButton variant="outlined" component={NextLink} href={trainingRoutes.routines}>
          Escolher rotina
        </KokyuButton>
        <KokyuButton
          variant="outlined"
          startIcon={<AddRoundedIcon />}
          component={NextLink}
          href={trainingRoutes.newRoutine}
        >
          Nova rotina
        </KokyuButton>
        <KokyuButton
          variant="outlined"
          startIcon={<CalendarMonthRoundedIcon />}
          component={NextLink}
          href={trainingRoutes.calendar}
        >
          Abrir calendário
        </KokyuButton>
      </Stack>

      <ActiveSessionConflictDialog
        open={Boolean(startWorkout.pendingConflict)}
        activeSessionName={startWorkout.activeSessionName}
        onContinue={startWorkout.resolveContinue}
        onDiscardAndStartNew={startWorkout.resolveDiscardAndStartNew}
        onCancel={startWorkout.cancelConflict}
      />
      <TrainingPreferencesDialog open={preferencesOpen} onClose={() => setPreferencesOpen(false)} />
    </Stack>
  );
}
