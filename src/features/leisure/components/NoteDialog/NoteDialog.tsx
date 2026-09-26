'use client';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { useEffect, useState } from 'react';

import { KokyuButton } from '@/design-system/components';

import {
  canSubmitNoteDraft,
  emptyNoteDraft,
  NoteFields,
  type NoteDraft,
} from '../NoteFields/NoteFields';

export type { NoteDraft } from '../NoteFields/NoteFields';

export interface NoteDialogProps {
  open: boolean;
  defaultValues?: Partial<NoteDraft>;
  onClose: () => void;
  onSave: (draft: NoteDraft) => void;
  isSubmitting?: boolean;
}

/** One dialog for text/checklist/link/idea notes — no Notion-style rich editor, just the fields each type actually needs. */
export function NoteDialog({
  open,
  defaultValues,
  onClose,
  onSave,
  isSubmitting,
}: NoteDialogProps) {
  const [draft, setDraft] = useState<NoteDraft>(emptyNoteDraft);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => setDraft({ ...emptyNoteDraft(), ...defaultValues }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resetting only when the dialog opens
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="note-dialog-title"
    >
      <DialogTitle id="note-dialog-title">
        {defaultValues ? 'Editar nota' : 'Nova nota'}
      </DialogTitle>
      <DialogContent>
        <Stack sx={{ marginTop: 1 }}>
          <NoteFields draft={draft} setDraft={setDraft} autoFocus />
        </Stack>
      </DialogContent>
      <DialogActions>
        <KokyuButton variant="text" onClick={onClose}>
          Cancelar
        </KokyuButton>
        <KokyuButton
          variant="contained"
          disabled={!canSubmitNoteDraft(draft)}
          loading={isSubmitting}
          onClick={() => onSave(draft)}
        >
          Salvar
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
