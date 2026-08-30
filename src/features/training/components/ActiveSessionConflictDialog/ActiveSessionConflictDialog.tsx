'use client';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { KokyuButton } from '@/design-system/components';

export interface ActiveSessionConflictDialogProps {
  open: boolean;
  activeSessionName: string | undefined;
  onContinue: () => void;
  onDiscardAndStartNew: () => void;
  onCancel: () => void;
}

export function ActiveSessionConflictDialog({
  open,
  activeSessionName,
  onContinue,
  onDiscardAndStartNew,
  onCancel,
}: ActiveSessionConflictDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      aria-labelledby="active-session-conflict-title"
    >
      <DialogTitle id="active-session-conflict-title">
        Você já tem um treino em andamento
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {activeSessionName
            ? `"${activeSessionName}" ainda está em andamento.`
            : 'Um treino ainda está em andamento.'}{' '}
          O que você quer fazer?
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
        <KokyuButton variant="text" onClick={onCancel}>
          Cancelar
        </KokyuButton>
        <KokyuButton variant="outlined" color="error" onClick={onDiscardAndStartNew}>
          Descartar e iniciar novo
        </KokyuButton>
        <KokyuButton variant="contained" onClick={onContinue}>
          Continuar treino atual
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
