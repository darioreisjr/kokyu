'use client';

import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { cardTokens } from '@/design-system/tokens/component';

import { trainingRoutes } from '../../constants/trainingRoutes';
import { exerciseTypeLabels } from '../../constants/exerciseCategories';
import { muscleGroupLabels } from '../../constants/muscleGroups';
import type { Exercise } from '../../types';

export interface ExerciseCardProps {
  exercise: Exercise;
  equipmentNames?: string[];
  onToggleFavorite?: () => void;
}

export function ExerciseCard({
  exercise,
  equipmentNames = [],
  onToggleFavorite,
}: ExerciseCardProps) {
  const primaryMuscleLabels = exercise.primaryMuscles
    .map((muscle) => muscleGroupLabels[muscle])
    .join(', ');

  return (
    <Box
      sx={(theme) => ({
        position: 'relative',
        borderRadius: cardTokens.radius,
        border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        backgroundColor: themePalette(theme).kokyu.surface.primary,
      })}
    >
      <Box
        component={NextLink}
        href={trainingRoutes.exercise(exercise.id)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          padding: 2,
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between', pr: 4 }}
        >
          <Typography variant="labelLarge" component="p">
            {exercise.name}
          </Typography>
        </Stack>
        <Typography
          variant="body2"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          {exerciseTypeLabels[exercise.exerciseType]}
          {primaryMuscleLabels ? ` · ${primaryMuscleLabels}` : ''}
        </Typography>
        {equipmentNames.length > 0 ? (
          <Typography
            variant="labelSmall"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
            noWrap
          >
            {equipmentNames.join(', ')}
          </Typography>
        ) : null}
      </Box>
      {onToggleFavorite ? (
        <IconButton
          size="small"
          aria-label={exercise.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          onClick={onToggleFavorite}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          {exercise.favorite ? (
            <FavoriteIcon fontSize="small" color="error" />
          ) : (
            <FavoriteBorderIcon fontSize="small" />
          )}
        </IconButton>
      ) : null}
    </Box>
  );
}
