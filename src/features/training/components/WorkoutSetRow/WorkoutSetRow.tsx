'use client';

import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { themePalette } from '@/design-system/theme/useThemePalette';

import { setTypeLabels } from '../../constants/setTypes';
import type { PerformedSet, SessionExercisePrescriptionSnapshot, SetType } from '../../types';
import { toDisplayWeight, toKg } from '../../utils/weightUnit';

export interface WorkoutSetRowProps {
  prescription: SessionExercisePrescriptionSnapshot;
  performedSet: PerformedSet | undefined;
  previousSet: PerformedSet | undefined;
  weightUnit: 'kg' | 'lb';
  showRpeRir: boolean;
  onLog: (patch: {
    setType: SetType;
    weightKg?: number;
    reps?: number;
    rpe?: number;
    rir?: number;
    completed: boolean;
  }) => void;
}

/** One row per set — kept narrow and touch-friendly for logging mid-set at the gym. */
export function WorkoutSetRow({
  prescription,
  performedSet,
  previousSet,
  weightUnit,
  showRpeRir,
  onLog,
}: WorkoutSetRowProps) {
  const [weight, setWeight] = useState(() =>
    performedSet?.weightKg !== undefined
      ? String(toDisplayWeight(performedSet.weightKg, weightUnit))
      : prescription.targetLoadKg !== undefined
        ? String(toDisplayWeight(prescription.targetLoadKg, weightUnit))
        : '',
  );
  const [reps, setReps] = useState(() =>
    String(performedSet?.reps ?? prescription.targetReps ?? ''),
  );
  const [rir, setRir] = useState(() => String(performedSet?.rir ?? ''));

  const isCompleted = Boolean(performedSet?.completed);
  const targetLabel = prescription.targetRepsMax
    ? `${prescription.targetReps ?? '?'}-${prescription.targetRepsMax}`
    : (prescription.targetReps ?? '—');

  function handleToggleComplete() {
    onLog({
      setType: prescription.setType,
      weightKg: weight ? toKg(Number(weight), weightUnit) : undefined,
      reps: reps ? Number(reps) : undefined,
      rir: rir ? Number(rir) : undefined,
      completed: !isCompleted,
    });
  }

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}>
      <Typography variant="labelSmall" sx={{ minWidth: 56 }}>
        {setTypeLabels[prescription.setType]} {prescription.setNumber}
      </Typography>
      <Typography
        variant="labelSmall"
        sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary, minWidth: 72 })}
      >
        {previousSet?.weightKg
          ? `${toDisplayWeight(previousSet.weightKg, weightUnit)}${weightUnit}×${previousSet.reps ?? '?'}`
          : `Meta ${targetLabel}`}
      </Typography>
      <TextField
        placeholder={weightUnit}
        type="number"
        size="small"
        value={weight}
        onChange={(event) => setWeight(event.target.value)}
        slotProps={{
          htmlInput: {
            inputMode: 'decimal',
            style: { textAlign: 'center' },
            'aria-label': `Peso, série ${prescription.setNumber}`,
          },
        }}
        sx={{ width: 76 }}
      />
      <TextField
        placeholder="reps"
        type="number"
        size="small"
        value={reps}
        onChange={(event) => setReps(event.target.value)}
        slotProps={{
          htmlInput: {
            inputMode: 'numeric',
            style: { textAlign: 'center' },
            'aria-label': `Repetições, série ${prescription.setNumber}`,
          },
        }}
        sx={{ width: 68 }}
      />
      {showRpeRir ? (
        <TextField
          placeholder="RIR"
          type="number"
          size="small"
          value={rir}
          onChange={(event) => setRir(event.target.value)}
          slotProps={{
            htmlInput: {
              inputMode: 'numeric',
              style: { textAlign: 'center' },
              'aria-label': `RIR, série ${prescription.setNumber}`,
            },
          }}
          sx={{ width: 64 }}
        />
      ) : null}
      <IconButton
        aria-label={isCompleted ? 'Marcar série como não concluída' : 'Concluir série'}
        aria-pressed={isCompleted}
        onClick={handleToggleComplete}
        sx={(theme) => ({
          backgroundColor: isCompleted ? themePalette(theme).kokyu.feedback.success : 'transparent',
          border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
          color: isCompleted
            ? themePalette(theme).kokyu.text.inverse
            : themePalette(theme).kokyu.text.secondary,
          '&:hover': {
            backgroundColor: isCompleted ? themePalette(theme).kokyu.feedback.success : undefined,
          },
        })}
      >
        <CheckRoundedIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
}
