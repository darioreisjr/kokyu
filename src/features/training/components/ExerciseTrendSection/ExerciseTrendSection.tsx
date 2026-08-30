'use client';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { KokyuTrendChart } from '@/design-system/components';

import { useExerciseTrend } from '../../hooks/useExerciseTrend';
import { useExercises } from '../../hooks/useExercises';
import { formatWeight } from '../../utils/weightUnit';

export interface ExerciseTrendSectionProps {
  weightUnit: 'kg' | 'lb';
}

/** 1RM estimado ao longo do tempo, por exercício — never presented as an exact measurement. */
export function ExerciseTrendSection({ weightUnit }: ExerciseTrendSectionProps) {
  const { exercises } = useExercises();
  const [exerciseId, setExerciseId] = useState('');
  const { trend } = useExerciseTrend(exerciseId || '__none__');

  return (
    <Stack spacing={1.5}>
      <Typography variant="labelLarge" component="h2">
        Progressão por exercício
      </Typography>
      <FormControl size="small" sx={{ maxWidth: 280 }}>
        <InputLabel id="progress-exercise-label">Exercício</InputLabel>
        <Select
          labelId="progress-exercise-label"
          label="Exercício"
          value={exerciseId}
          onChange={(event) => setExerciseId(event.target.value)}
        >
          {exercises.map((exercise) => (
            <MenuItem key={exercise.id} value={exercise.id}>
              {exercise.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {exerciseId ? (
        <KokyuTrendChart
          points={trend.map((point) => ({
            label: new Date(point.date).toLocaleDateString('pt-BR'),
            value: point.value,
          }))}
          ariaLabel="1RM estimado"
          valueFormatter={(value) => formatWeight(value, weightUnit)}
        />
      ) : (
        <Typography variant="body2">Selecione um exercício para ver sua evolução.</Typography>
      )}
    </Stack>
  );
}
