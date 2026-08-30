'use client';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { useEffect, useState } from 'react';

import { KokyuButton, KokyuTextField } from '@/design-system/components';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';

export interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
}

const CONFIRMATION_WORD = 'EXCLUIR';

/**
 * There is no backend that can actually delete an account — this
 * dialog is real UI for a real irreversible action, but its "submit"
 * deliberately can't succeed. Typing the confirmation word only
 * unlocks the final button; pressing it reports the honest outcome
 * (unavailable) instead of a fake success, which would be worse than
 * doing nothing.
 */
export function DeleteAccountDialog({ open, onClose }: DeleteAccountDialogProps) {
  const { showError } = useSnackbar();
  const [confirmationText, setConfirmationText] = useState('');

  useEffect(() => {
    if (!open) {
      queueMicrotask(() => setConfirmationText(''));
    }
  }, [open]);

  function handleDelete() {
    showError('Exclusão de conta indisponível — o Kokyu ainda não tem um backend para isso.');
    onClose();
  }

  const canConfirm = confirmationText === CONFIRMATION_WORD;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="delete-account-title"
    >
      <DialogTitle id="delete-account-title">Excluir sua conta?</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5}>
          <DialogContentText>
            Esta ação remove permanentemente sua conta e todos os seus dados no Kokyu. Não é
            possível desfazer.
          </DialogContentText>
          <KokyuTextField
            label={`Digite ${CONFIRMATION_WORD} para confirmar`}
            value={confirmationText}
            onChange={(event) => setConfirmationText(event.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <KokyuButton type="button" variant="text" onClick={onClose}>
          Cancelar
        </KokyuButton>
        <KokyuButton
          type="button"
          variant="contained"
          color="error"
          disabled={!canConfirm}
          onClick={handleDelete}
        >
          Excluir minha conta
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
