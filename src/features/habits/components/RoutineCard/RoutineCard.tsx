'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import NextLink from 'next/link';

import { KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { habitRoutes } from '../../constants/habitRoutes';
import type { Habit } from '../../types/habit.types';
import type { HabitRoutine } from '../../types/routine.types';

export interface RoutineCardProps {
  routine: HabitRoutine;
  habits: Habit[];
  onDuplicate?: (id: string) => void;
  onArchive?: (id: string) => void;
}

export function RoutineCard({ routine, habits }: RoutineCardProps) {
  const routineHabits = routine.items
    .map((item) => habits.find((h) => h.id === item.habitId))
    .filter((h): h is Habit => Boolean(h));

  const timeLabel =
    routine.timeOfDay === 'morning'
      ? 'Manhã'
      : routine.timeOfDay === 'afternoon'
        ? 'Tarde'
        : routine.timeOfDay === 'evening'
          ? 'Noite'
          : 'Qualquer horário';

  return (
    <Card
      variant="outlined"
      sx={(theme) => ({
        borderRadius: 3,
        borderColor: themePalette(theme).kokyu.border.default,
        backgroundColor: themePalette(theme).kokyu.background.paper,
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: themePalette(theme).kokyu.border.strong,
        },
      })}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Stack spacing={0.5}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                  {routine.name}
                </Typography>
                <Chip label={timeLabel} size="small" variant="outlined" />
                {routine.estimatedDurationMinutes && (
                  <Chip
                    label={`~${routine.estimatedDurationMinutes} min`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Stack>
              {routine.description && (
                <Typography variant="body2" color="text.secondary">
                  {routine.description}
                </Typography>
              )}
            </Stack>

            <IconButton
              component={NextLink}
              href={habitRoutes.routineEdit(routine.id)}
              size="small"
              aria-label={`Editar rotina ${routine.name}`}
            >
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Sequência ({routineHabits.length} hábitos):
            </Typography>
            <Stack spacing={1}>
              {routine.items.map((item, idx) => {
                const h = habits.find((candidate) => candidate.id === item.habitId);
                if (!h) return null;
                return (
                  <Box
                    key={item.habitId}
                    sx={(theme) => ({
                      p: 1.2,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      backgroundColor: themePalette(theme).kokyu.surface.secondary,
                    })}
                  >
                    <Typography
                      variant="caption"
                      sx={(theme) => ({
                        fontWeight: 700,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: themePalette(theme).kokyu.action.primary,
                        color: themePalette(theme).kokyu.text.inverse,
                      })}
                    >
                      {idx + 1}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                      {h.name}
                    </Typography>
                    {item.delayAfterPreviousMinutes ? (
                      <Typography variant="caption" color="text.secondary">
                        +{item.delayAfterPreviousMinutes}m
                      </Typography>
                    ) : null}
                  </Box>
                );
              })}
            </Stack>
          </Stack>

          <KokyuButton
            component={NextLink}
            href={habitRoutes.routinePlayer(routine.id)}
            variant="contained"
            fullWidth
            startIcon={<PlayArrowRoundedIcon />}
          >
            Iniciar Rotina
          </KokyuButton>
        </Stack>
      </CardContent>
    </Card>
  );
}
