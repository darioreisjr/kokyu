'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { KokyuTagsField, KokyuTextField } from '@/design-system/components';
import { extractPastedUrl } from '@/shared/links/httpLink';
import { useTagSuggestions } from '@/shared/tags/useTagSuggestions';

import { CoverImageField } from '../CoverImageField/CoverImageField';
import { contextTagIds } from '../../constants/contextTags';
import { getApplicableStatuses, getStatusLabel } from '../../constants/leisureStatuses';
import { leisureItemTypeDefinitions } from '../../constants/leisureItemTypes';
import { placeCategoryDefinitions } from '../../constants/placeCategories';
import {
  leisureItemFormDefaultValues,
  leisureItemSchema,
  type LeisureItemFormValues,
} from '../../schemas/leisureItemSchema';
import { leisureItemService } from '../../services/leisureItemService';
import type { LeisureItemType } from '../../types/leisureItem.types';

export interface LeisureItemFormProps {
  /** `id` of the <form>, so a submit button outside it (dialog actions, page footer) can target it. */
  formId: string;
  defaultValues?: Partial<LeisureItemFormValues>;
  /** Locks the type selector — used when adding directly from a type-specific section like Lugares or Hobbies. Never `unsorted`: this form is always about a real, classified type, even when it's "organizing" one away from Quick Capture's "Ainda não sei". */
  lockedType?: Exclude<LeisureItemType, 'unsorted'>;
  onSubmit: (values: LeisureItemFormValues) => void;
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

async function loadLeisureItemTags(): Promise<string[]> {
  const items = await leisureItemService.getLeisureItems();
  return items.flatMap((item) => item.tags);
}

/**
 * One form for creating a fresh item, editing an existing one, and
 * "organizing" a Quick Capture ("Ainda não sei") item into a real
 * type — only the fields relevant to the chosen `type` ever render,
 * so this never becomes the "hundreds of optional fields" screen the
 * spec explicitly warns against. Shared by `LeisureItemDialog` and the
 * full-page flows (e.g. `/app/tempo-livre/hobbies/novo`); it starts from
 * `defaultValues` each time it mounts.
 */
export function LeisureItemForm({
  formId,
  defaultValues,
  lockedType,
  onSubmit,
}: LeisureItemFormProps) {
  const tagSuggestions = useTagSuggestions(loadLeisureItemTags, { fixedTags: contextTagIds });
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeisureItemFormValues>({
    resolver: zodResolver(leisureItemSchema),
    defaultValues: {
      ...leisureItemFormDefaultValues,
      ...defaultValues,
      ...(lockedType ? { type: lockedType } : {}),
    },
  });

  const [type, durationType] = useWatch({ control, name: ['type', 'durationType'] });
  const applicableStatuses = getApplicableStatuses(type);

  return (
    <Stack
      component="form"
      id={formId}
      spacing={2.5}
      onSubmit={handleSubmit((values) => onSubmit(values))}
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
        render={({ field, fieldState }) => (
          <CoverImageField
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
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
            <KokyuTextField label="Endereço (opcional)" sx={{ flex: 1 }} {...register('address')} />
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
          <KokyuTagsField
            value={field.value ?? []}
            onChange={field.onChange}
            onBlur={field.onBlur}
            suggestions={tagSuggestions}
            placeholder="curto, relaxar..."
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
        <Controller
          control={control}
          name="sourceUrl"
          render={({ field, fieldState }) => (
            <KokyuTextField
              label="Link (opcional)"
              placeholder="https://..."
              sx={{ flex: 1 }}
              {...field}
              value={field.value ?? ''}
              onBlur={(event) => {
                field.onChange(extractPastedUrl(event.target.value));
                field.onBlur();
              }}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <KokyuTextField
          label="Recomendado por (opcional)"
          sx={{ flex: 1 }}
          {...register('recommendedBy')}
        />
      </Stack>
    </Stack>
  );
}
