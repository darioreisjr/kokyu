'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { useForm } from 'react-hook-form';

import { KokyuButton, KokyuTextField } from '@/design-system/components';

import { leisureItemTypeDefinitions } from '../../constants/leisureItemTypes';
import {
  quickCaptureDefaultValues,
  quickCaptureSchema,
  type QuickCaptureFormValues,
} from '../../schemas/quickCaptureSchema';

export interface QuickCaptureDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: QuickCaptureFormValues) => void;
  isSubmitting?: boolean;
}

/**
 * "Guardar para depois" — the global capture flow. Deliberately just
 * four fields, all but the title optional: leaving type blank saves
 * the item as `unsorted` ("Ainda não sei"), organized properly later
 * from Para depois.
 */
export function QuickCaptureDialog({
  open,
  onClose,
  onSave,
  isSubmitting,
}: QuickCaptureDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuickCaptureFormValues>({
    resolver: zodResolver(quickCaptureSchema),
    defaultValues: quickCaptureDefaultValues,
  });

  function handleClose() {
    reset(quickCaptureDefaultValues);
    onClose();
  }

  function submit(values: QuickCaptureFormValues) {
    onSave(values);
    reset(quickCaptureDefaultValues);
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="quick-capture-title"
    >
      <DialogTitle id="quick-capture-title">Guardar para depois</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="quick-capture-form"
          spacing={2.5}
          sx={{ marginTop: 1 }}
          onSubmit={handleSubmit(submit)}
          noValidate
        >
          <KokyuTextField
            label="Título"
            autoFocus
            error={Boolean(errors.title)}
            helperText={errors.title?.message}
            {...register('title')}
          />
          <KokyuTextField select label="Tipo (opcional)" defaultValue="" {...register('type')}>
            <MenuItem value="">Ainda não sei</MenuItem>
            {leisureItemTypeDefinitions
              .filter((definition) => definition.id !== 'unsorted')
              .map((definition) => (
                <MenuItem key={definition.id} value={definition.id}>
                  {definition.label}
                </MenuItem>
              ))}
          </KokyuTextField>
          <KokyuTextField label="Link (opcional)" {...register('sourceUrl')} />
          <KokyuTextField label="Nota (opcional)" multiline minRows={2} {...register('notes')} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <KokyuButton variant="text" onClick={handleClose}>
          Cancelar
        </KokyuButton>
        <KokyuButton
          type="submit"
          form="quick-capture-form"
          variant="contained"
          loading={isSubmitting}
        >
          Salvar
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
