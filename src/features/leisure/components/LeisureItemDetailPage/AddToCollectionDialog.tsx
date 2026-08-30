'use client';

import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { KokyuButton } from '@/design-system/components';

import type { LeisureCollection } from '../../types/collection.types';

export interface AddToCollectionDialogProps {
  open: boolean;
  itemId: string;
  collections: LeisureCollection[];
  onClose: () => void;
  onToggle: (collectionId: string, checked: boolean) => void;
}

/**
 * "Adicionar a uma lista" — an item belongs to a collection purely by
 * id membership, so toggling here never moves or duplicates it; the
 * same item can be checked into any number of collections at once.
 */
export function AddToCollectionDialog({
  open,
  itemId,
  collections,
  onClose,
  onToggle,
}: AddToCollectionDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="add-to-collection-title"
    >
      <DialogTitle id="add-to-collection-title">Adicionar a uma lista</DialogTitle>
      <DialogContent>
        {collections.length === 0 ? (
          <DialogContentText>
            Você ainda não criou nenhuma lista. Crie uma em Biblioteca.
          </DialogContentText>
        ) : (
          <Stack spacing={0.5}>
            {collections.map((collection) => (
              <FormControlLabel
                key={collection.id}
                control={
                  <Checkbox
                    checked={collection.itemIds.includes(itemId)}
                    onChange={(event) => onToggle(collection.id, event.target.checked)}
                  />
                }
                label={<Typography variant="body1">{collection.name}</Typography>}
              />
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <KokyuButton variant="text" onClick={onClose}>
          Fechar
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
