'use client';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { useEffect, useState } from 'react';

import { KokyuButton, KokyuDateField, KokyuTextField } from '@/design-system/components';

import { toDateKey } from '../../utils/dateHelpers';

export interface GoalProgressUpdateValues {
  value: number;
  date: string;
  note?: string;
}

export interface GoalProgressUpdateDialogProps {
  open: boolean;
  currentValue: number;
  unitLabel: string;
  onClose: () => void;
  onSave: (values: GoalProgressUpdateValues) => void;
  isSubmitting?: boolean;
}

/** Manual progress update — used only when `Goal.progressMode === 'manual'`; automatic goals never show this affordance (see `GoalDetailPage`). */
export function GoalProgressUpdateDialog({
  open,
  currentValue,
  unitLabel,
  onClose,
  onSave,
  isSubmitting = false,
}: GoalProgressUpdateDialogProps) {
  const [value, setValue] = useState(String(currentValue));
  const [date, setDate] = useState<Date>(new Date());
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        setValue(String(currentValue));
        setDate(new Date());
        setNote('');
      });
    }
  }, [open, currentValue]);

  function handleSubmit() {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return;
    onSave({ value: numericValue, date: toDateKey(date), note: note || undefined });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="goal-progress-update-title"
    >
      <DialogTitle id="goal-progress-update-title">Atualizar progresso</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ paddingTop: 1 }}>
          <KokyuTextField
            label={`Novo valor (${unitLabel})`}
            type="number"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            autoFocus
          />
          <KokyuDateField
            label="Data"
            value={date}
            onChange={(next) => next && setDate(next)}
            maxDate={new Date()}
          />
          <KokyuTextField
            label="Nota (opcional)"
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
        <KokyuButton variant="contained" onClick={handleSubmit} loading={isSubmitting}>
          Salvar
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
