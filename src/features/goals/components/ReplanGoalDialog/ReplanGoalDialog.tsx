'use client';

import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import { useState } from 'react';

import { KokyuButton, KokyuDateField, KokyuTextField } from '@/design-system/components';

import { toDateKey } from '../../utils/dateHelpers';

export interface ReplanGoalDialogProps {
  open: boolean;
  currentTargetDate?: string;
  onClose: () => void;
  onConfirm: (newTargetDate: string | undefined, note?: string) => void;
  isSubmitting?: boolean;
}

/** "O prazo terminou. O que você quer fazer?" → Replanejar é uma das opções — nunca marca a meta como fracassada automaticamente. */
export function ReplanGoalDialog({
  open,
  currentTargetDate,
  onClose,
  onConfirm,
  isSubmitting = false,
}: ReplanGoalDialogProps) {
  const [noDeadline, setNoDeadline] = useState(false);
  const [date, setDate] = useState<Date | null>(
    currentTargetDate ? new Date(`${currentTargetDate}T00:00:00`) : null,
  );
  const [note, setNote] = useState('');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="replan-goal-title"
    >
      <DialogTitle id="replan-goal-title">Replanejar prazo</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ paddingTop: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={noDeadline}
                onChange={(event) => setNoDeadline(event.target.checked)}
              />
            }
            label="Sem prazo"
          />
          {!noDeadline ? (
            <KokyuDateField label="Novo prazo" value={date} onChange={setDate} />
          ) : null}
          <KokyuTextField
            label="Motivo (opcional)"
            multiline
            minRows={2}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <KokyuButton variant="text" onClick={onClose}>
          Cancelar
        </KokyuButton>
        <KokyuButton
          variant="contained"
          onClick={() =>
            onConfirm(noDeadline || !date ? undefined : toDateKey(date), note || undefined)
          }
          loading={isSubmitting}
        >
          Replanejar
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
