'use client';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';

import { KokyuTextField, EmptyState } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { exerciseTypeLabels } from '../../constants/exerciseCategories';
import { muscleGroupLabels } from '../../constants/muscleGroups';
import { useExercises } from '../../hooks/useExercises';
import type { Exercise } from '../../types';
import { filterExercises, sortExercisesByName } from '../../utils/exerciseFilters';

export interface ExercisePickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
  /** Exercise ids to hide — e.g. ones already in the routine, when the picker is used to add a superset partner. */
  excludeIds?: string[];
}

export function ExercisePickerDialog({
  open,
  onClose,
  onSelect,
  excludeIds = [],
}: ExercisePickerDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { exercises } = useExercises();
  const [search, setSearch] = useState('');

  const results = useMemo(() => {
    const filtered = filterExercises(exercises, { search }).filter(
      (exercise) => !excludeIds.includes(exercise.id),
    );
    return sortExercisesByName(filtered);
  }, [exercises, search, excludeIds]);

  function handleSelect(exercise: Exercise) {
    onSelect(exercise);
    setSearch('');
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      aria-labelledby="exercise-picker-title"
    >
      <DialogTitle id="exercise-picker-title">Adicionar exercício</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <KokyuTextField
          autoFocus
          placeholder="Buscar exercício"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
            htmlInput: { 'aria-label': 'Buscar exercício' },
          }}
        />
        {results.length === 0 ? (
          <EmptyState title="Nenhum exercício encontrado." />
        ) : (
          <Stack sx={{ maxHeight: 420, overflowY: 'auto' }}>
            {results.map((exercise) => (
              <ListItemButton key={exercise.id} onClick={() => handleSelect(exercise)}>
                <ListItemText
                  primary={exercise.name}
                  secondary={
                    <Typography
                      variant="labelSmall"
                      sx={(innerTheme) => ({
                        color: themePalette(innerTheme).kokyu.text.secondary,
                      })}
                    >
                      {exerciseTypeLabels[exercise.exerciseType]} ·{' '}
                      {exercise.primaryMuscles
                        .map((muscle) => muscleGroupLabels[muscle])
                        .join(', ')}
                    </Typography>
                  }
                />
              </ListItemButton>
            ))}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
