'use client';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';

import { KokyuButton, KokyuTextField } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { calculateWarmupSets } from '../../services/warmupCalculator';

export interface WarmupCalculatorDialogProps {
  open: boolean;
  onClose: () => void;
  initialWorkingWeightKg?: number;
  initialWorkingReps?: number;
}

export function WarmupCalculatorDialog({
  open,
  onClose,
  initialWorkingWeightKg,
  initialWorkingReps,
}: WarmupCalculatorDialogProps) {
  const [workingWeightKg, setWorkingWeightKg] = useState(initialWorkingWeightKg ?? 60);
  const [workingReps, setWorkingReps] = useState(initialWorkingReps ?? 8);

  const warmupSets = useMemo(
    () => calculateWarmupSets(workingWeightKg, workingReps),
    [workingWeightKg, workingReps],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="warmup-calculator-title"
    >
      <DialogTitle id="warmup-calculator-title">Calculadora de aquecimento</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <KokyuTextField
            label="Peso de trabalho (kg)"
            type="number"
            value={workingWeightKg}
            onChange={(event) => setWorkingWeightKg(Number(event.target.value))}
          />
          <KokyuTextField
            label="Repetições de trabalho"
            type="number"
            value={workingReps}
            onChange={(event) => setWorkingReps(Number(event.target.value))}
          />

          <Stack spacing={0.5}>
            {warmupSets.map((set, index) => (
              <Stack
                key={index}
                direction="row"
                spacing={1}
                sx={{ justifyContent: 'space-between' }}
              >
                <Typography variant="body2">Série {index + 1}</Typography>
                <Typography
                  variant="body2"
                  sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                >
                  {set.weightKg}kg × {set.reps} ({Math.round(set.percentOfWorkingWeight * 100)}%)
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </DialogContent>
      <Stack direction="row" sx={{ justifyContent: 'flex-end', p: 2 }}>
        <KokyuButton variant="text" onClick={onClose}>
          Fechar
        </KokyuButton>
      </Stack>
    </Dialog>
  );
}
