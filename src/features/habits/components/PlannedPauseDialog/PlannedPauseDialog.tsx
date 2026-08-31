'use client';

import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { KokyuButton } from '@/design-system/components';
import type { Habit } from '../../types/habit.types';

export interface PlannedPauseDialogProps {
  open: boolean;
  habit: Habit | null;
  onClose: () => void;
  onConfirm: (startDate: string, endDate?: string, reason?: string) => Promise<void> | void;
}

export function PlannedPauseDialog({
  open,
  onClose,
  onConfirm,
}: PlannedPauseDialogProps) {
  const today = new Date().toISOString().split('T')[0]!;
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(startDate, endDate || undefined, reason.trim() || undefined);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="planned-pause-title"
    >
      <DialogTitle id="planned-pause-title">
        <Typography variant="h5" component="span" sx={{ fontWeight: 600 }}>
          Pausa Programada
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Durante a pausa, este hábito não gerará obrigações e sua sequência (streak) não será
            penalizada.
          </Typography>

          <TextField
            fullWidth
            type="date"
            label="Data de início da pausa"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            fullWidth
            type="date"
            label="Data de retorno (opcional)"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            fullWidth
            label="Motivo (opcional)"
            placeholder="Ex: Férias, viagem, recuperação..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            size="small"
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
          Cancelar
        </Button>
        <KokyuButton
          variant="contained"
          onClick={handleConfirm}
          disabled={isSubmitting || !startDate}
        >
          Confirmar Pausa
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
