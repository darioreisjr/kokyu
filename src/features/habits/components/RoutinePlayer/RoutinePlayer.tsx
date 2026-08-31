'use client';

import { useState } from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FastForwardRoundedIcon from '@mui/icons-material/FastForwardRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import NextLink from 'next/link';

import { KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { habitRoutes } from '../../constants/habitRoutes';
import type { Habit } from '../../types/habit.types';
import type { HabitRoutine } from '../../types/routine.types';
import { HabitAreaIcon } from '../HabitAreaIcon/HabitAreaIcon';
import { HabitTimerDialog } from '../HabitTimerDialog/HabitTimerDialog';

export interface RoutinePlayerProps {
  routine: HabitRoutine;
  habits: Habit[];
  onCompleteHabit: (habitId: string, loggedValue?: number) => Promise<void>;
  onFinishRoutine: () => void;
}

export function RoutinePlayer({
  routine,
  habits,
  onCompleteHabit,
  onFinishRoutine,
}: RoutinePlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, setCompletedIds] = useState<string[]>([]);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const totalSteps = routine.items.length;
  const currentItem = routine.items[currentIndex];
  const currentHabit = habits.find((h) => h.id === currentItem?.habitId);

  const handleNext = async (skip = false) => {
    if (currentHabit && !skip) {
      await onCompleteHabit(currentHabit.id);
      setCompletedIds((prev) => [...prev, currentHabit.id]);
    }

    if (currentIndex + 1 < totalSteps) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsDone(true);
      onFinishRoutine();
    }
  };

  const progressPercent = Math.round(((currentIndex) / totalSteps) * 100);

  if (isDone) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Stack spacing={3} sx={{ alignItems: 'center' }}>
          <CheckCircleRoundedIcon sx={{ fontSize: 72, color: 'success.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Rotina Concluída!</Typography>
          <Typography variant="body1" color="text.secondary">
            Excelente! Você concluiu todos os passos da rotina &ldquo;{routine.name}&rdquo;.
          </Typography>
          <KokyuButton component={NextLink} href={habitRoutes.today} variant="contained" size="large">
            Voltar para Hoje
          </KokyuButton>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
            {routine.name} — Passo {currentIndex + 1} de {totalSteps}
          </Typography>
          <Button
            component={NextLink}
            href={habitRoutes.today}
            startIcon={<CloseRoundedIcon />}
            color="inherit"
            size="small"
          >
            Sair do modo foco
          </Button>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={progressPercent}
          sx={{ borderRadius: 1, height: 6 }}
        />

        {currentHabit ? (
          <Card
            variant="outlined"
            sx={(theme) => ({
              borderRadius: 3.5,
              p: 2,
              backgroundColor: themePalette(theme).kokyu.background.paper,
            })}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Stack spacing={3} sx={{ alignItems: 'center' }}>
                <HabitAreaIcon area={currentHabit.area} size="large" />

                <Stack spacing={1}>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
                    {currentHabit.name}
                  </Typography>
                  {currentHabit.description && (
                    <Typography variant="body1" color="text.secondary">
                      {currentHabit.description}
                    </Typography>
                  )}
                  {currentHabit.cue && (
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                      Gatilho: &ldquo;{currentHabit.cue}&rdquo;
                    </Typography>
                  )}
                </Stack>

                <Stack direction="row" spacing={2} sx={{ width: '100%', pt: 2 }}>
                  {currentHabit.trackingType === 'duration' && (
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<TimerRoundedIcon />}
                      onClick={() => setIsTimerOpen(true)}
                      sx={{ flex: 1 }}
                    >
                      Abrir Timer
                    </Button>
                  )}

                  <KokyuButton
                    variant="contained"
                    size="large"
                    onClick={() => handleNext(false)}
                    startIcon={<CheckCircleRoundedIcon />}
                    sx={{ flex: 2 }}
                  >
                    Concluir Passo
                  </KokyuButton>

                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => handleNext(true)}
                    endIcon={<FastForwardRoundedIcon />}
                    color="inherit"
                  >
                    Pular
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Typography>Hábito não encontrado.</Typography>
        )}
      </Stack>

      <HabitTimerDialog
        open={isTimerOpen}
        habit={currentHabit ?? null}
        onClose={() => setIsTimerOpen(false)}
        onComplete={async (mins) => {
          if (currentHabit) {
            await onCompleteHabit(currentHabit.id, mins);
            setCompletedIds((prev) => [...prev, currentHabit.id]);
            handleNext(false);
          }
        }}
      />
    </Container>
  );
}
