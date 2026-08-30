'use client';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useEffect, useState } from 'react';

import { KokyuButton, KokyuTextField } from '@/design-system/components';

export interface CreateCollectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

/** "Criar lista" — just a name, per the spec's own examples ("Filmes para domingo", "Jogos curtos"); items get added to it from wherever they already are, never by moving them here first. */
export function CreateCollectionDialog({ open, onClose, onSave }: CreateCollectionDialogProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => setName(''));
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="create-collection-title"
    >
      <DialogTitle id="create-collection-title">Nova lista</DialogTitle>
      <DialogContent>
        <KokyuTextField
          label="Nome da lista"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoFocus
          sx={{ marginTop: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <KokyuButton variant="text" onClick={onClose}>
          Cancelar
        </KokyuButton>
        <KokyuButton
          variant="contained"
          disabled={!name.trim()}
          onClick={() => onSave(name.trim())}
        >
          Criar
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
