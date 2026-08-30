'use client';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import { useEffect, useState } from 'react';

import { KokyuButton, KokyuTextField } from '@/design-system/components';

import type { StorageLocation } from '../../types/pantry.types';

export interface SelectStorageLocationDialogProps {
  open: boolean;
  title: string;
  description: string;
  storageLocations: StorageLocation[];
  onClose: () => void;
  onConfirm: (storageLocationId: string) => void;
}

/** Shared by "Adicionar à despensa" (one item) and "Guardar itens comprados" (all checked items) — one confirmed location, never a silent automatic move. */
export function SelectStorageLocationDialog({
  open,
  title,
  description,
  storageLocations,
  onClose,
  onConfirm,
}: SelectStorageLocationDialogProps) {
  const [storageLocationId, setStorageLocationId] = useState(storageLocations[0]?.id ?? '');

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => setStorageLocationId(storageLocations[0]?.id ?? ''));
  }, [open, storageLocations]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="select-storage-title"
    >
      <DialogTitle id="select-storage-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ marginBottom: 2.5 }}>{description}</DialogContentText>
        <KokyuTextField
          select
          label="Local"
          value={storageLocationId}
          onChange={(event) => setStorageLocationId(event.target.value)}
        >
          {storageLocations.map((location) => (
            <MenuItem key={location.id} value={location.id}>
              {location.name}
            </MenuItem>
          ))}
        </KokyuTextField>
      </DialogContent>
      <DialogActions>
        <KokyuButton variant="text" onClick={onClose}>
          Cancelar
        </KokyuButton>
        <KokyuButton
          variant="contained"
          disabled={!storageLocationId}
          onClick={() => onConfirm(storageLocationId)}
        >
          Confirmar
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
