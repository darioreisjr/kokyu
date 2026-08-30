'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { KokyuButton, KokyuDateField, KokyuTextField } from '@/design-system/components';

import {
  planEntryDefaultValues,
  planEntrySchema,
  type PlanEntryFormValues,
} from '../../schemas/planEntrySchema';
import { fromDateKey, toDateKey } from '../../utils/dateHelpers';

const recurrenceOptions = [
  { id: 'none', label: 'Não repetir' },
  { id: 'daily', label: 'Diariamente' },
  { id: 'weekly', label: 'Semanalmente' },
  { id: 'custom', label: 'Personalizado' },
];

export interface PlanEntryDialogProps {
  open: boolean;
  /** Prefills the form — used both to edit an existing entry and to plan a fresh one for a given date (e.g. from a `LeisureItem`'s "Planejar"). A fresh plan can legitimately prefill a title too (from the item), so this alone never implies editing — see `mode`. */
  defaultValues?: Partial<PlanEntryFormValues>;
  /** Which heading/intent this is — never inferred from `defaultValues` having a title, since a brand-new plan entry can already come prefilled with one. @default 'create' */
  mode?: 'create' | 'edit';
  onClose: () => void;
  onSave: (values: PlanEntryFormValues) => void;
  isSubmitting?: boolean;
}

/**
 * One form for both "planejar um novo item" and "editar um
 * planejamento existente" — the caller decides which via `mode`.
 * `reminder` is a plain flag: reusing Settings → Notificações is the
 * caller's job (this dialog never requests browser permission or
 * shows a second notification system).
 */
export function PlanEntryDialog({
  open,
  defaultValues,
  mode = 'create',
  onClose,
  onSave,
  isSubmitting,
}: PlanEntryDialogProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlanEntryFormValues>({
    resolver: zodResolver(planEntrySchema),
    defaultValues: { ...planEntryDefaultValues, ...defaultValues },
  });

  useEffect(() => {
    if (open) reset({ ...planEntryDefaultValues, ...defaultValues });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resetting only when the dialog opens, not on every defaultValues identity change
  }, [open]);

  function handleClose() {
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="plan-entry-title"
    >
      <DialogTitle id="plan-entry-title">
        {mode === 'edit' ? 'Editar planejamento' : 'Planejar atividade'}
      </DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="plan-entry-form"
          spacing={2.5}
          sx={{ marginTop: 1 }}
          onSubmit={handleSubmit((values) => onSave(values))}
          noValidate
        >
          <KokyuTextField
            label="Título"
            error={Boolean(errors.title)}
            helperText={errors.title?.message}
            {...register('title')}
          />
          <Controller
            control={control}
            name="date"
            render={({ field }) => (
              <KokyuDateField
                label="Dia"
                value={field.value ? fromDateKey(field.value) : null}
                onChange={(value) => field.onChange(value ? toDateKey(value) : '')}
                error={Boolean(errors.date)}
                helperText={errors.date?.message}
              />
            )}
          />
          <Stack direction="row" spacing={2}>
            <KokyuTextField
              label="Início (opcional)"
              type="time"
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ flex: 1 }}
              {...register('startTime')}
            />
            <KokyuTextField
              label="Fim (opcional)"
              type="time"
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ flex: 1 }}
              {...register('endTime')}
            />
          </Stack>
          <KokyuTextField
            label="Duração em minutos (opcional)"
            type="number"
            slotProps={{ htmlInput: { min: 0 } }}
            error={Boolean(errors.duration)}
            helperText={errors.duration?.message}
            {...register('duration', {
              setValueAs: (value) => (value === '' ? undefined : Number(value)),
            })}
          />
          <Controller
            control={control}
            name="recurrence"
            render={({ field }) => (
              <KokyuTextField select label="Recorrência" {...field}>
                {recurrenceOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.label}
                  </MenuItem>
                ))}
              </KokyuTextField>
            )}
          />
          <KokyuTextField label="Notas (opcional)" multiline minRows={2} {...register('notes')} />
          <Controller
            control={control}
            name="reminder"
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(field.value)}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                }
                label="Lembrete"
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <KokyuButton variant="text" onClick={handleClose}>
          Cancelar
        </KokyuButton>
        <KokyuButton
          type="submit"
          form="plan-entry-form"
          variant="contained"
          loading={isSubmitting}
        >
          Salvar
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
