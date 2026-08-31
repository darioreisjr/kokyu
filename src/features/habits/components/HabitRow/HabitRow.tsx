'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import NextLink from 'next/link';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { habitRoutes } from '../../constants/habitRoutes';
import type { HabitOccurrence } from '../../types/occurrence.types';
import { HabitAreaIcon } from '../HabitAreaIcon/HabitAreaIcon';

export interface HabitRowProps {
  occurrence: HabitOccurrence;
  onQuickComplete?: (habitId: string) => void;
}

export function HabitRow({ occurrence, onQuickComplete }: HabitRowProps) {
  const { habit, status, loggedValue, target } = occurrence;
  const isCompleted = status === 'completed';

  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1.5,
        borderRadius: 2,
        border: `1px solid ${isCompleted ? themePalette(theme).kokyu.action.primary : themePalette(theme).kokyu.border.default}`,
        backgroundColor: themePalette(theme).kokyu.background.paper,
        transition: 'all 0.15s ease',
        '&:hover': {
          borderColor: themePalette(theme).kokyu.border.strong,
        },
      })}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0, flex: 1 }}>
        <HabitAreaIcon area={habit.area} size="small" />

        <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            component={NextLink}
            href={habitRoutes.detail(habit.id)}
            variant="body1"
            noWrap
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

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {habit.preferredTime && (
              <Typography
                variant="caption"
                sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
              >
                {habit.preferredTime}
              </Typography>
            )}
            {target.type === 'duration' && (
              <Typography
                variant="caption"
                sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
              >
                {loggedValue} / {target.targetMinutes} min
              </Typography>
            )}
          </Stack>
        </Stack>
      </Stack>

      <IconButton
        onClick={() => onQuickComplete?.(habit.id)}
        color={isCompleted ? 'primary' : 'default'}
        aria-label={`Marcar ${habit.name} como ${isCompleted ? 'não concluído' : 'concluído'}`}
        sx={{ ml: 1 }}
      >
        {isCompleted ? <CheckCircleRoundedIcon /> : <RadioButtonUncheckedRoundedIcon />}
      </IconButton>
    </Box>
  );
}
