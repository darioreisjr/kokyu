'use client';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { KokyuButton } from '@/design-system/components';

import type { ConfirmActionRequest } from '../../hooks/useConfirmAction';

export interface ConfirmActionDialogProps {
  request: ConfirmActionRequest | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/** The one confirmation dialog every destructive Nutrição action shares — fed by `useConfirmAction`, never built ad hoc per call site. */
export function ConfirmActionDialog({ request, onConfirm, onCancel }: ConfirmActionDialogProps) {
  return (
    <Dialog
      open={Boolean(request)}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      aria-labelledby="confirm-action-title"
    >
      <DialogTitle id="confirm-action-title">{request?.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{request?.description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <KokyuButton variant="text" onClick={onCancel}>
          Cancelar
        </KokyuButton>
        <KokyuButton variant="contained" color="error" onClick={onConfirm}>
          {request?.confirmLabel ?? 'Confirmar'}
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
