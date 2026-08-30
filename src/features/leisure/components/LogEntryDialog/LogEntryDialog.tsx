'use client';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

import { KokyuButton, KokyuDateField, KokyuTextField } from '@/design-system/components';

import { RatingInput } from '../RatingInput/RatingInput';

export interface LogEntryDraft {
  completedAt: Date;
  rating: number | null;
  notes: string;
  duration: number | undefined;
}

export interface LogEntryDialogProps {
  open: boolean;
  /** "Assistiu Interestelar" / "Visitou o MASP" — the dialog's own title reflects what's being logged. */
  itemTitle: string;
  onClose: () => void;
  onSave: (draft: LogEntryDraft) => void;
  isSubmitting?: boolean;
}

const emptyDraft = (): LogEntryDraft => ({
  completedAt: new Date(),
  rating: null,
  notes: '',
  duration: undefined,
});

/**
 * "Marcar como concluído/visitado" — creates one `LeisureLogEntry`
 * occurrence. Never mutates or duplicates the source `LeisureItem`,
 * so the same movie/place/hobby can be logged again later.
 */
export function LogEntryDialog({
  open,
  itemTitle,
  onClose,
  onSave,
  isSubmitting,
}: LogEntryDialogProps) {
  const [draft, setDraft] = useState<LogEntryDraft>(emptyDraft);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => setDraft(emptyDraft()));
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth aria-labelledby="log-entry-title">
      <DialogTitle id="log-entry-title">Registrar experiência</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ marginTop: 1 }}>
          <Typography variant="body2">{itemTitle}</Typography>
          <KokyuDateField
            label="Quando"
            value={draft.completedAt}
            onChange={(value) =>
              value && setDraft((current) => ({ ...current, completedAt: value }))
            }
          />
          <Stack spacing={0.5}>
            <Typography variant="labelMedium">Avaliação (opcional)</Typography>
            <RatingInput
              value={draft.rating}
              onChange={(value) => setDraft((current) => ({ ...current, rating: value }))}
            />
          </Stack>
          <KokyuTextField
            label="Duração em minutos (opcional)"
            type="number"
            slotProps={{ htmlInput: { min: 0 } }}
            value={draft.duration ?? ''}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                duration: event.target.value === '' ? undefined : Number(event.target.value),
              }))
            }
          />
          <KokyuTextField
            label="O que você achou? (opcional)"
            multiline
            minRows={2}
            value={draft.notes}
            onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <KokyuButton variant="text" onClick={onClose}>
          Cancelar
        </KokyuButton>
        <KokyuButton variant="contained" loading={isSubmitting} onClick={() => onSave(draft)}>
          Registrar
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
