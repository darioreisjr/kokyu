'use client';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { KokyuButton, KokyuTextField } from '@/design-system/components';

import { recoveryEstimateService } from '../../services/recoveryEstimateService';
import { toDateKey } from '../../utils/dateHelpers';

export interface RecoveryCheckInDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

/** "Como você está se sentindo para treinar?" — self-reported only, never a diagnosis. */
export function RecoveryCheckInDialog({ open, onClose, onSubmitted }: RecoveryCheckInDialogProps) {
  const [energyLevel, setEnergyLevel] = useState<number | null>(3);
  const [disposition, setDisposition] = useState<number | null>(3);
  const [muscleSoreness, setMuscleSoreness] = useState<number | null>(2);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      await recoveryEstimateService.submitRecoveryCheckIn({
        date: toDateKey(new Date()),
        energyLevel: energyLevel ?? 3,
        disposition: disposition ?? 3,
        muscleSoreness: muscleSoreness ?? 3,
        notes: notes || undefined,
      });
      onSubmitted();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="recovery-checkin-title"
    >
      <DialogTitle id="recovery-checkin-title">
        Como você está se sentindo para treinar?
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Stack spacing={0.5}>
            <Typography variant="labelSmall">Energia</Typography>
            <Rating
              max={5}
              value={energyLevel}
              onChange={(_event, value) => setEnergyLevel(value)}
              aria-label="Energia, de 1 a 5"
            />
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="labelSmall">Disposição</Typography>
            <Rating
              max={5}
              value={disposition}
              onChange={(_event, value) => setDisposition(value)}
              aria-label="Disposição, de 1 a 5"
            />
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="labelSmall">Desconforto muscular informado</Typography>
            <Rating
              max={5}
              value={muscleSoreness}
              onChange={(_event, value) => setMuscleSoreness(value)}
              aria-label="Desconforto muscular, de 1 a 5"
            />
          </Stack>
          <KokyuTextField
            label="Notas (opcional)"
            multiline
            minRows={2}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <KokyuButton variant="text" onClick={onClose}>
          Cancelar
        </KokyuButton>
        <KokyuButton variant="contained" loading={isSubmitting} onClick={handleSubmit}>
          Salvar
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
