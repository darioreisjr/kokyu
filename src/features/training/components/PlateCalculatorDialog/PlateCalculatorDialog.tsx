'use client';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';

import { KokyuButton, KokyuTextField } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { calculatePlateBreakdown } from '../../services/plateCalculator';
import type { TrainingPreferences } from '../../types';

export interface PlateCalculatorDialogProps {
  open: boolean;
  onClose: () => void;
  preferences: TrainingPreferences;
  initialTargetWeightKg?: number;
}

export function PlateCalculatorDialog({
  open,
  onClose,
  preferences,
  initialTargetWeightKg,
}: PlateCalculatorDialogProps) {
  const [targetWeightKg, setTargetWeightKg] = useState(
    initialTargetWeightKg ?? preferences.defaultBarWeightKg,
  );
  const [barWeightKg, setBarWeightKg] = useState(preferences.defaultBarWeightKg);

  const breakdown = useMemo(
    () => calculatePlateBreakdown(targetWeightKg, barWeightKg, preferences.availablePlatesKg),
    [targetWeightKg, barWeightKg, preferences.availablePlatesKg],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="plate-calculator-title"
    >
      <DialogTitle id="plate-calculator-title">Calculadora de anilhas</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <KokyuTextField
            label="Peso desejado (kg)"
            type="number"
            value={targetWeightKg}
            onChange={(event) => setTargetWeightKg(Number(event.target.value))}
          />
          <KokyuTextField
            label="Peso da barra (kg)"
            type="number"
            value={barWeightKg}
            onChange={(event) => setBarWeightKg(Number(event.target.value))}
          />

          <Stack spacing={0.5}>
            <Typography variant="labelLarge">Por lado</Typography>
            {breakdown.platesPerSide.length === 0 ? (
              <Typography
                variant="body2"
                sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
              >
                Nenhuma anilha necessária.
              </Typography>
            ) : (
              <Typography variant="displaySmall" component="p">
                {breakdown.platesPerSide.join(' + ')}
              </Typography>
            )}
          </Stack>

          <Typography
            variant="body2"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Total: {breakdown.achievedWeightKg}kg
            {!breakdown.achievable
              ? ` (mais próximo possível — faltam ${Math.abs(breakdown.remainderKg)}kg)`
              : ''}
          </Typography>
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
