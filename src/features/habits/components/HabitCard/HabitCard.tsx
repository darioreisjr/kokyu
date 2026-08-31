'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import FastForwardRoundedIcon from '@mui/icons-material/FastForwardRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import NextLink from 'next/link';

import { KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { formatHabitValueWithUnit } from '../../constants/habitUnits';
import { habitRoutes } from '../../constants/habitRoutes';
import type { HabitOccurrence } from '../../types/occurrence.types';
import { HabitAreaIcon } from '../HabitAreaIcon/HabitAreaIcon';

export interface HabitCardProps {
  occurrence: HabitOccurrence;
  onQuickComplete?: (habitId: string) => void;
  onQuickIncrement?: (habitId: string, delta: number) => void;
  onOpenTimer?: (habitId: string) => void;
  onSkip?: (habitId: string) => void;
  onAddNote?: (habitId: string) => void;
}

export function HabitCard({
  occurrence,
  onQuickComplete,
  onQuickIncrement,
  onOpenTimer,
  onSkip,
  onAddNote,
}: HabitCardProps) {
  const { habit, status, progressPercent, loggedValue, target, isWithinLimit } = occurrence;
  const isCompleted = status === 'completed';
  const isSkipped = status === 'skipped';
  const isReduce = habit.direction === 'reduce';

  let targetDescription = '';
  if (target.type === 'quantity') {
    targetDescription = `Meta: ${formatHabitValueWithUnit(target.targetValue, target.unit, target.customUnitLabel)}`;
  } else if (target.type === 'duration') {
    targetDescription = `Meta: ${target.targetMinutes} min`;
  } else if (target.type === 'count') {
    targetDescription = `Meta: ${target.targetValue}x`;
  } else if (target.type === 'limit') {
    targetDescription = `Limite: máx. ${target.maxLimit} ${target.unit ?? 'vezes'}`;
  }

  return (
    <Card
      variant="outlined"
      sx={(theme) => ({
        borderRadius: 3,
        borderColor: isCompleted
          ? themePalette(theme).kokyu.action.primary
          : themePalette(theme).kokyu.border.default,
        backgroundColor: themePalette(theme).kokyu.background.paper,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: themePalette(theme).kokyu.border.strong,
        },
      })}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <HabitAreaIcon area={habit.area} size="medium" />

            <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography
                  component={NextLink}
                  href={habitRoutes.detail(habit.id)}
                  variant="subtitle1"
                  sx={(theme) => ({
                    textDecoration: 'none',
                    color: themePalette(theme).kokyu.text.primary,
                    fontWeight: 600,
                    '&:hover': {
                      color: themePalette(theme).kokyu.action.primary,
                    },
                  })}
                >
                  {habit.name}
                </Typography>

                {isSkipped && (
                  <Chip label="Pulado" size="small" variant="outlined" color="default" />
                )}

                {isReduce && (
                  <Chip
                    label={isWithinLimit ? 'Dentro do limite' : 'Acima do limite'}
                    size="small"
                    color={isWithinLimit ? 'success' : 'warning'}
                  />
                )}
              </Stack>

              {habit.description && (
                <Typography
                  variant="body2"
                  sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                  noWrap
                >
                  {habit.description}
                </Typography>
              )}

              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', pt: 0.5 }}>
                {targetDescription && (
                  <Typography
                    variant="caption"
                    sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                  >
                    {targetDescription}
                  </Typography>
                )}

                {habit.preferredTime && (
                  <Chip label={habit.preferredTime} size="small" variant="outlined" />
                )}
              </Stack>
            </Stack>
          </Stack>

          {(target.type === 'quantity' || target.type === 'duration' || target.type === 'count') && (
            <Stack spacing={0.5}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography
                  variant="caption"
                  sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                >
                  {target.type === 'duration'
                    ? `${loggedValue} / ${target.targetMinutes} min`
                    : `${loggedValue} / ${'targetValue' in target ? target.targetValue : 1}`}
                </Typography>
                <Typography
                  variant="caption"
                  sx={(theme) => ({
                    fontWeight: 600,
                    color: isCompleted
                      ? themePalette(theme).kokyu.action.primary
                      : themePalette(theme).kokyu.text.secondary,
                  })}
                >
                  {progressPercent}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, progressPercent)}
                aria-label={`Progresso do hábito: ${progressPercent}%`}
                sx={{ borderRadius: 1, height: 6 }}
              />
            </Stack>
          )}

          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              pt: 0.5,
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              {target.type === 'binary' && (
                <KokyuButton
                  variant={isCompleted ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={
                    isCompleted ? <CheckCircleRoundedIcon /> : <RadioButtonUncheckedRoundedIcon />
                  }
                  onClick={() => onQuickComplete?.(habit.id)}
                  aria-label={`Marcar ${habit.name} como ${isCompleted ? 'não concluído' : 'concluído'}`}
                >
                  {isCompleted ? 'Concluído' : 'Concluir'}
                </KokyuButton>
              )}

              {(target.type === 'quantity' || target.type === 'count') && (
                <Stack direction="row" spacing={1}>
                  <KokyuButton
                    variant="outlined"
                    size="small"
                    onClick={() => onQuickIncrement?.(habit.id, 1)}
                    aria-label={`Adicionar 1 ao hábito ${habit.name}`}
                  >
                    +1
                  </KokyuButton>
                  {target.type === 'quantity' && (
                    <KokyuButton
                      variant="outlined"
                      size="small"
                      onClick={() => onQuickIncrement?.(habit.id, 5)}
                      aria-label={`Adicionar 5 ao hábito ${habit.name}`}
                    >
                      +5
                    </KokyuButton>
                  )}
                  <KokyuButton
                    variant={isCompleted ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => onQuickComplete?.(habit.id)}
                    aria-label={`Concluir hábito ${habit.name}`}
                  >
                    {isCompleted ? 'Concluído' : 'Concluir'}
                  </KokyuButton>
                </Stack>
              )}

              {target.type === 'duration' && (
                <Stack direction="row" spacing={1}>
                  <KokyuButton
                    variant="contained"
                    size="small"
                    startIcon={<TimerRoundedIcon />}
                    onClick={() => onOpenTimer?.(habit.id)}
                    aria-label={`Iniciar timer para ${habit.name}`}
                  >
                    Timer
                  </KokyuButton>
                  <KokyuButton
                    variant={isCompleted ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => onQuickComplete?.(habit.id)}
                    aria-label={`Concluir ${habit.name}`}
                  >
                    {isCompleted ? 'Concluído' : 'Concluir'}
                  </KokyuButton>
                </Stack>
              )}

              {target.type === 'limit' && (
                <KokyuButton
                  variant="outlined"
                  size="small"
                  onClick={() => onQuickIncrement?.(habit.id, 1)}
                  aria-label={`Registrar ocorrência de ${habit.name}`}
                >
                  Registrar ocorrência (+1)
                </KokyuButton>
              )}
            </Stack>

            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Pular hoje (neutro)">
                <IconButton
                  size="small"
                  onClick={() => onSkip?.(habit.id)}
                  aria-label={`Pular ${habit.name} hoje`}
                >
                  <FastForwardRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Adicionar nota">
                <IconButton
                  size="small"
                  onClick={() => onAddNote?.(habit.id)}
                  aria-label={`Adicionar nota para ${habit.name}`}
                >
                  <EditNoteRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
