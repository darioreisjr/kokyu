'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Autocomplete from '@mui/material/Autocomplete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { KokyuButton, KokyuTextField } from '@/design-system/components';

import { CoverImageField } from '../CoverImageField/CoverImageField';
import { contextTagDefinitions } from '../../constants/contextTags';
import { getApplicableStatuses, getStatusLabel } from '../../constants/leisureStatuses';
import { leisureItemTypeDefinitions } from '../../constants/leisureItemTypes';
import { placeCategoryDefinitions } from '../../constants/placeCategories';
import {
  leisureItemFormDefaultValues,
  leisureItemSchema,
  type LeisureItemFormValues,
} from '../../schemas/leisureItemSchema';
import type { LeisureItemType } from '../../types/leisureItem.types';

export interface LeisureItemDialogProps {
  open: boolean;
  defaultValues?: Partial<LeisureItemFormValues>;
  /** Locks the type selector — used when adding directly from a type-specific section like Lugares or Hobbies. Never `unsorted`: this form is always about a real, classified type, even when it's "organizing" one away from Quick Capture's "Ainda não sei". */
  lockedType?: Exclude<LeisureItemType, 'unsorted'>;
  onClose: () => void;
  onSave: (values: LeisureItemFormValues) => void;
  isSubmitting?: boolean;
}

const durationTypeOptions = [
  { id: 'fixed', label: 'Fixa' },
  { id: 'flexible', label: 'Flexível' },
  { id: 'unknown', label: 'Não sei' },
];

const priorityOptions = [
  { id: '', label: 'Sem prioridade' },
  { id: 'low', label: 'Baixa' },
  { id: 'medium', label: 'Média' },
  { id: 'high', label: 'Alta' },
];

/**
 * One form for creating a fresh item, editing an existing one, and
 * "organizing" a Quick Capture ("Ainda não sei") item into a real
 * type — only the fields relevant to the chosen `type` ever render,
 * so this never becomes the "hundreds of optional fields" screen the
 * spec explicitly warns against.
 */
export function LeisureItemDialog({
  open,
  defaultValues,
  lockedType,
  onClose,
  onSave,
  isSubmitting,
}: LeisureItemDialogProps) {
  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<LeisureItemFormValues>({
    resolver: zodResolver(leisureItemSchema),
    defaultValues: {
      ...leisureItemFormDefaultValues,
      ...defaultValues,
      ...(lockedType ? { type: lockedType } : {}),
    },
  });

  useEffect(() => {
    if (open)
      reset({
        ...leisureItemFormDefaultValues,
        ...defaultValues,
        ...(lockedType ? { type: lockedType } : {}),
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resetting only when the dialog opens
  }, [open]);

  const type = watch('type');
  const durationType = watch('durationType');
  const applicableStatuses = getApplicableStatuses(type);

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
        <Stack
          component="form"
          id="leisure-item-form"
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
            name="coverImage"
            render={({ field }) => (
              <CoverImageField value={field.value} onChange={field.onChange} />
            )}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <KokyuTextField
                  select
                  label="Tipo"
                  disabled={Boolean(lockedType)}
                  sx={{ flex: 1 }}
                  {...field}
                >
                  {leisureItemTypeDefinitions
                    .filter((definition) => definition.id !== 'unsorted')
                    .map((definition) => (
                      <MenuItem key={definition.id} value={definition.id}>
                        {definition.label}
                      </MenuItem>
                    ))}
                </KokyuTextField>
              )}
            />
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <KokyuTextField select label="Status" sx={{ flex: 1 }} {...field}>
                  {applicableStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {getStatusLabel(type, status)}
                    </MenuItem>
                  ))}
                </KokyuTextField>
              )}
            />
          </Stack>

          {type === 'book' || type === 'audiobook' ? (
            <Stack direction="row" spacing={2}>
              <KokyuTextField label="Autor" sx={{ flex: 1 }} {...register('author')} />
              {type === 'book' ? (
                <KokyuTextField
                  label="Páginas"
                  type="number"
                  slotProps={{ htmlInput: { min: 0 } }}
                  sx={{ flex: 1 }}
                  {...register('pages', {
                    setValueAs: (value) => (value === '' ? undefined : Number(value)),
                  })}
                />
              ) : null}
            </Stack>
          ) : null}

          {type === 'game' ? <KokyuTextField label="Plataforma" {...register('platform')} /> : null}

          {type === 'place' || type === 'event' ? (
            <Stack spacing={2}>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <KokyuTextField select label="Categoria" {...field}>
                    {placeCategoryDefinitions.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.label}
                      </MenuItem>
                    ))}
                  </KokyuTextField>
                )}
              />
              <Stack direction="row" spacing={2}>
                <KokyuTextField
                  label="Endereço (opcional)"
                  sx={{ flex: 1 }}
                  {...register('address')}
                />
                <KokyuTextField label="Cidade (opcional)" sx={{ flex: 1 }} {...register('city')} />
              </Stack>
            </Stack>
          ) : null}

          <Stack direction="row" spacing={2}>
            <Controller
              control={control}
              name="durationType"
              render={({ field }) => (
                <KokyuTextField select label="Duração" sx={{ flex: 1 }} {...field}>
                  {durationTypeOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.label}
                    </MenuItem>
                  ))}
                </KokyuTextField>
              )}
            />
            {durationType === 'fixed' ? (
              <KokyuTextField
                label="Duração (min)"
                type="number"
                slotProps={{ htmlInput: { min: 0 } }}
                sx={{ flex: 1 }}
                {...register('estimatedDuration', {
                  setValueAs: (value) => (value === '' ? undefined : Number(value)),
                })}
              />
            ) : null}
            {durationType === 'flexible' ? (
              <KokyuTextField
                label="Sessão mínima útil (min)"
                type="number"
                slotProps={{ htmlInput: { min: 0 } }}
                sx={{ flex: 1 }}
                {...register('minimumUsefulDuration', {
                  setValueAs: (value) => (value === '' ? undefined : Number(value)),
                })}
              />
            ) : null}
          </Stack>

          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <KokyuTextField
                select
                label="Prioridade (opcional)"
                value={field.value ?? ''}
                onChange={(event) => field.onChange(event.target.value || undefined)}
              >
                {priorityOptions.map((option) => (
                  <MenuItem key={option.id || 'none'} value={option.id}>
                    {option.label}
                  </MenuItem>
                ))}
              </KokyuTextField>
            )}
          />

          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <Autocomplete
                multiple
                freeSolo
                options={contextTagDefinitions.map((tag) => tag.id)}
                value={field.value}
                onChange={(_event, value) => field.onChange(value)}
                renderInput={(params) => (
                  <KokyuTextField
                    {...params}
                    label="Tags (opcional)"
                    placeholder="curto, relaxar..."
                  />
                )}
              />
            )}
          />

          <KokyuTextField
            label="Descrição (opcional)"
            multiline
            minRows={2}
            {...register('description')}
          />
          <Stack direction="row" spacing={2}>
            <KokyuTextField label="Link (opcional)" sx={{ flex: 1 }} {...register('sourceUrl')} />
            <KokyuTextField
              label="Recomendado por (opcional)"
              sx={{ flex: 1 }}
              {...register('recommendedBy')}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <KokyuButton variant="text" onClick={onClose}>
          Cancelar
        </KokyuButton>
        <KokyuButton
          type="submit"
          form="leisure-item-form"
          variant="contained"
          loading={isSubmitting}
        >
          Salvar
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
