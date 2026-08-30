'use client';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { addDays } from 'date-fns';
import { useEffect, useState } from 'react';

import { KokyuButton, KokyuDateField } from '@/design-system/components';

import { fromDateKey, toDateKey } from '../../utils/dateHelpers';

export interface DuplicateDayDialogProps {
  open: boolean;
  sourceDate: string;
  onClose: () => void;
  onConfirm: (targetDate: string) => void;
}

/** "Copiar este dia" — every meal on `sourceDate`, duplicated onto a target the user actually picks (never guessed). */
export function DuplicateDayDialog({
  open,
  sourceDate,
  onClose,
  onConfirm,
}: DuplicateDayDialogProps) {
  const [targetDate, setTargetDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => setTargetDate(addDays(fromDateKey(sourceDate), 1)));
  }, [open, sourceDate]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="duplicate-day-title"
    >
      <DialogTitle id="duplicate-day-title">Copiar este dia</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ marginTop: 1 }}>
          <DialogContentText>
            Escolha para qual dia copiar as refeições planejadas.
          </DialogContentText>
          <KokyuDateField label="Copiar para" value={targetDate} onChange={setTargetDate} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <KokyuButton variant="text" onClick={onClose}>
          Cancelar
        </KokyuButton>
        <KokyuButton
          variant="contained"
          disabled={!targetDate}
          onClick={() => targetDate && onConfirm(toDateKey(targetDate))}
        >
          Copiar
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
