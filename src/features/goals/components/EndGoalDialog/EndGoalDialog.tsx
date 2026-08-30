'use client';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import { useState } from 'react';

import { KokyuButton, KokyuTextField } from '@/design-system/components';

export type EndGoalOutcome =
  'completed' | 'abandoned' | 'notRelevant' | 'replacedByAnother' | 'other';

export interface EndGoalDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (outcome: EndGoalOutcome, note?: string) => void;
  isSubmitting?: boolean;
}

const outcomeOptions: { value: EndGoalOutcome; label: string }[] = [
  { value: 'completed', label: 'Concluída' },
  { value: 'abandoned', label: 'Abandonada' },
  { value: 'notRelevant', label: 'Não faz mais sentido' },
  { value: 'replacedByAnother', label: 'Substituída por outra' },
  { value: 'other', label: 'Outro' },
];

/** Encerrar não apaga a meta — ela vai para o Histórico (ver `goalService.abandonGoal`/`completeGoal`, nunca `deleteGoal`). */
export function EndGoalDialog({
  open,
  onClose,
  onConfirm,
  isSubmitting = false,
}: EndGoalDialogProps) {
  const [outcome, setOutcome] = useState<EndGoalOutcome>('abandoned');
  const [note, setNote] = useState('');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth aria-labelledby="end-goal-title">
      <DialogTitle id="end-goal-title">Encerrar meta</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ paddingTop: 1 }}>
          <RadioGroup
            value={outcome}
            onChange={(event) => setOutcome(event.target.value as EndGoalOutcome)}
          >
            {outcomeOptions.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
              />
            ))}
          </RadioGroup>
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
        <KokyuButton
          variant="contained"
          onClick={() => onConfirm(outcome, note || undefined)}
          loading={isSubmitting}
        >
          Confirmar
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
