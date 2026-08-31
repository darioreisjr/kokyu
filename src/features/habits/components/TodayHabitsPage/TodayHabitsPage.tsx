'use client';

import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import NextLink from 'next/link';

import { EmptyState, KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { habitRoutes } from '../../constants/habitRoutes';
import { useHabits } from '../../hooks/useHabits';
import { useRoutines } from '../../hooks/useRoutines';
import { useTodayHabits } from '../../hooks/useTodayHabits';
import type { Habit } from '../../types/habit.types';
import { HabitCard } from '../HabitCard/HabitCard';
import { HabitQuickNoteDialog } from '../HabitQuickNoteDialog/HabitQuickNoteDialog';
import { HabitTimerDialog } from '../HabitTimerDialog/HabitTimerDialog';
import { RoutineCard } from '../RoutineCard/RoutineCard';

export function TodayHabitsPage() {
  const {
    occurrences,
    grouped,
    dailyScore,
    isLoading,
    quickComplete,
    quickIncrement,
    skipOccurrence,
    addNote,
    undoLastAction,
    canUndo,
  } = useTodayHabits();

  const { habits } = useHabits();
  const { routines } = useRoutines();

  const [activeTimerHabit, setActiveTimerHabit] = useState<Habit | null>(null);
  const [activeNoteHabit, setActiveNoteHabit] = useState<Habit | null>(null);

  const activeRoutines = useMemo(() => routines.filter((r) => r.active), [routines]);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Hoje
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Acompanhe sua consistência diária e execute suas rotinas no seu ritmo.
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            {canUndo && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<UndoRoundedIcon />}
                onClick={undoLastAction}
              >
                Desfazer
              </Button>
            )}

            <KokyuButton
              component={NextLink}
              href={habitRoutes.new}
              variant="contained"
              startIcon={<AddRoundedIcon />}
            >
              Novo hábito
            </KokyuButton>
          </Stack>
        </Stack>

        {/* Daily Score KPI Header */}
        <Card
          variant="outlined"
          sx={(theme) => ({
            borderRadius: 3,
            p: 1,
            backgroundColor: themePalette(theme).kokyu.surface.secondary,
            borderColor: themePalette(theme).kokyu.border.default,
          })}
        >
          <CardContent>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              sx={{
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2,
              }}
            >
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Score de Hoje (calculado apenas com hábitos agendados do dia)
                </Typography>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'baseline' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {dailyScore?.scorePercent ?? 100}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dailyScore?.completedCount ?? 0} de {dailyScore?.scheduledCount ?? 0} agendados
                    concluídos
                  </Typography>
                </Stack>
              </Stack>

              <Box sx={{ width: { xs: '100%', sm: 240 } }}>
                <LinearProgress
                  variant="determinate"
                  value={dailyScore?.scorePercent ?? 0}
                  aria-label={`Score de hoje: ${dailyScore?.scorePercent ?? 0}%`}
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Active Routines Strip */}
        {activeRoutines.length > 0 && (
          <Stack spacing={1.5}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              Rotinas do Dia
            </Typography>
            <Grid container spacing={2}>
              {activeRoutines.map((routine) => (
                <Grid key={routine.id} size={{ xs: 12, md: 6 }}>
                  <RoutineCard routine={routine} habits={habits} />
                </Grid>
              ))}
            </Grid>
          </Stack>
        )}

        {/* Habits by Time of Day */}
        {isLoading ? (
          <Stack sx={{ alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Stack>
        ) : occurrences.length === 0 ? (
          <EmptyState
            icon={CheckCircleOutlineRoundedIcon}
            title="Nenhum hábito agendado para hoje"
            description="Você está livre ou seus hábitos estão agendados para outros dias."
            action={
              <KokyuButton
                component={NextLink}
                href={habitRoutes.new}
                variant="contained"
              >
                Criar novo hábito
              </KokyuButton>
            }
          />
        ) : (
          <Stack spacing={3}>
            {grouped.morning.length > 0 && (
              <Stack spacing={1.5}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                  Manhã
                </Typography>
                <Grid container spacing={2}>
                  {grouped.morning.map((occ) => (
                    <Grid key={occ.habitId} size={{ xs: 12, md: 6 }}>
                      <HabitCard
                        occurrence={occ}
                        onQuickComplete={quickComplete}
                        onQuickIncrement={quickIncrement}
                        onSkip={skipOccurrence}
                        onOpenTimer={() => setActiveTimerHabit(occ.habit)}
                        onAddNote={() => setActiveNoteHabit(occ.habit)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            )}

            {grouped.afternoon.length > 0 && (
              <Stack spacing={1.5}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                  Tarde
                </Typography>
                <Grid container spacing={2}>
                  {grouped.afternoon.map((occ) => (
                    <Grid key={occ.habitId} size={{ xs: 12, md: 6 }}>
                      <HabitCard
                        occurrence={occ}
                        onQuickComplete={quickComplete}
                        onQuickIncrement={quickIncrement}
                        onSkip={skipOccurrence}
                        onOpenTimer={() => setActiveTimerHabit(occ.habit)}
                        onAddNote={() => setActiveNoteHabit(occ.habit)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            )}

            {grouped.evening.length > 0 && (
              <Stack spacing={1.5}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                  Noite
                </Typography>
                <Grid container spacing={2}>
                  {grouped.evening.map((occ) => (
                    <Grid key={occ.habitId} size={{ xs: 12, md: 6 }}>
                      <HabitCard
                        occurrence={occ}
                        onQuickComplete={quickComplete}
                        onQuickIncrement={quickIncrement}
                        onSkip={skipOccurrence}
                        onOpenTimer={() => setActiveTimerHabit(occ.habit)}
                        onAddNote={() => setActiveNoteHabit(occ.habit)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            )}

            {grouped.anytime.length > 0 && (
              <Stack spacing={1.5}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                  Qualquer horário
                </Typography>
                <Grid container spacing={2}>
                  {grouped.anytime.map((occ) => (
                    <Grid key={occ.habitId} size={{ xs: 12, md: 6 }}>
                      <HabitCard
                        occurrence={occ}
                        onQuickComplete={quickComplete}
                        onQuickIncrement={quickIncrement}
                        onSkip={skipOccurrence}
                        onOpenTimer={() => setActiveTimerHabit(occ.habit)}
                        onAddNote={() => setActiveNoteHabit(occ.habit)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            )}
          </Stack>
        )}
      </Stack>

      <HabitTimerDialog
        open={Boolean(activeTimerHabit)}
        habit={activeTimerHabit}
        onClose={() => setActiveTimerHabit(null)}
        onComplete={async (mins, note) => {
          if (activeTimerHabit) {
            await quickComplete(activeTimerHabit.id, mins);
            if (note) {
              await addNote(activeTimerHabit.id, note);
            }
          }
        }}
      />

      <HabitQuickNoteDialog
        open={Boolean(activeNoteHabit)}
        habit={activeNoteHabit}
        onClose={() => setActiveNoteHabit(null)}
        onSave={async (note, context) => {
          if (activeNoteHabit) {
            await addNote(activeNoteHabit.id, note, context);
          }
        }}
      />
    </Container>
  );
}
