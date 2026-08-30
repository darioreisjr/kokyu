'use client';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { KokyuButton } from '@/design-system/components';

export interface FinishWorkoutDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (perceivedEffort?: number) => void;
  isSubmitting?: boolean;
}

/** Optional post-workout reflection — never required, never used as a diagnostic (per the spec's own "não usar esse campo como diagnóstico"). */
export function FinishWorkoutDialog({
  open,
  onClose,
  onConfirm,
  isSubmitting,
}: FinishWorkoutDialogProps) {
  const [perceivedEffort, setPerceivedEffort] = useState<number | null>(null);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="finish-workout-title"
    >
      <DialogTitle id="finish-workout-title">Como foi o treino?</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Opcional — ajuda a acompanhar seu esforço geral ao longo do tempo.
        </DialogContentText>
        <Stack spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="labelSmall">Esforço geral (1-10)</Typography>
          <Rating
            max={10}
            value={perceivedEffort}
            onChange={(_event, value) => setPerceivedEffort(value)}
            aria-label="Esforço geral, de 1 a 10"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <KokyuButton variant="text" onClick={() => onConfirm(undefined)} disabled={isSubmitting}>
          Pular
        </KokyuButton>
        <KokyuButton
          variant="contained"
          loading={isSubmitting}
          onClick={() => onConfirm(perceivedEffort ?? undefined)}
        >
          Finalizar treino
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
