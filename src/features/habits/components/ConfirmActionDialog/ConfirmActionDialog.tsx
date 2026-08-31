'use client';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';

import { KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

export interface ConfirmActionDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export function ConfirmActionDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDestructive = false,
  onConfirm,
  onClose,
}: ConfirmActionDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth aria-labelledby="confirm-action-title">
      <DialogTitle id="confirm-action-title">
        <Typography variant="h5" component="span" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={onClose} color="inherit">
          {cancelLabel}
        </Button>
        <KokyuButton
          variant="contained"
          onClick={onConfirm}
          sx={
            isDestructive
              ? (theme) => ({
                  backgroundColor: themePalette(theme).kokyu.feedback.error,
                  '&:hover': {
                    backgroundColor: themePalette(theme).kokyu.feedback.error,
                    opacity: 0.9,
                  },
                })
              : undefined
          }
        >
          {confirmLabel}
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
