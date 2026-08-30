'use client';

import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { cardTokens } from '@/design-system/tokens/component';

import { trainingRoutes } from '../../constants/trainingRoutes';
import { muscleGroupLabels } from '../../constants/muscleGroups';
import type { WorkoutRoutine } from '../../types';
import { formatDurationMinutes } from '../../utils/trainingFormatting';

export interface RoutineCardProps {
  routine: WorkoutRoutine;
  onToggleFavorite?: () => void;
}

export function RoutineCard({ routine, onToggleFavorite }: RoutineCardProps) {
  return (
    <Box
      sx={(theme) => ({
        position: 'relative',
        borderRadius: cardTokens.radius,
        border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        backgroundColor: themePalette(theme).kokyu.surface.primary,
        opacity: routine.archived ? 0.6 : 1,
      })}
    >
      <Box
        component={NextLink}
        href={trainingRoutes.routine(routine.id)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          padding: 2,
          textDecoration: 'none',
          color: 'inherit',
          pr: 5,
        }}
      >
        <Typography variant="labelLarge" component="p">
          {routine.name}
        </Typography>
        <Typography
          variant="body2"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          {routine.exercises.length} exercícios
          {routine.estimatedDurationMinutes
            ? ` · ${formatDurationMinutes(routine.estimatedDurationMinutes * 60)}`
            : ''}
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
          {routine.muscleGroups.slice(0, 4).map((muscle) => (
            <Chip key={muscle} label={muscleGroupLabels[muscle]} size="small" variant="outlined" />
          ))}
        </Stack>
        {routine.archived ? <Chip label="Arquivada" size="small" /> : null}
      </Box>
      {onToggleFavorite ? (
        <IconButton
          size="small"
          aria-label={routine.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          onClick={onToggleFavorite}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          {routine.favorite ? (
            <FavoriteIcon fontSize="small" color="error" />
          ) : (
            <FavoriteBorderIcon fontSize="small" />
          )}
        </IconButton>
      ) : null}
    </Box>
  );
}
