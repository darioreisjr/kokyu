'use client';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';

import { KokyuButton } from '@/design-system/components';

import type { LeisureItemFormValues } from '../../schemas/leisureItemSchema';
import type { LeisureItemType } from '../../types/leisureItem.types';
import { LeisureItemForm } from '../LeisureItemForm/LeisureItemForm';

export interface LeisureItemDialogProps {
  open: boolean;
  defaultValues?: Partial<LeisureItemFormValues>;
  /** Locks the type selector — see `LeisureItemForm`. */
  lockedType?: Exclude<LeisureItemType, 'unsorted'>;
  onClose: () => void;
  onSave: (values: LeisureItemFormValues) => void;
  isSubmitting?: boolean;
}

const FORM_ID = 'leisure-item-form';

/**
 * `LeisureItemForm` in a modal — the add/edit flow of every Tempo Livre
 * screen except Hobbies' "Adicionar", which is a full page. The dialog
 * unmounts its content on close, so each open starts a fresh form.
 */
export function LeisureItemDialog({
  open,
  defaultValues,
  lockedType,
  onClose,
  onSave,
  isSubmitting,
}: LeisureItemDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="leisure-item-dialog-title"
    >
      <DialogTitle id="leisure-item-dialog-title">
        {defaultValues ? 'Editar item' : 'Novo item'}
      </DialogTitle>
      <DialogContent>
        <Stack sx={{ marginTop: 1 }}>
          <LeisureItemForm
            formId={FORM_ID}
            defaultValues={defaultValues}
            lockedType={lockedType}
            onSubmit={onSave}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <KokyuButton variant="text" onClick={onClose}>
          Cancelar
        </KokyuButton>
        <KokyuButton type="submit" form={FORM_ID} variant="contained" loading={isSubmitting}>
          Salvar
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
