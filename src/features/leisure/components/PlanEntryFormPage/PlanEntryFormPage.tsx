'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { KokyuButton, KokyuDateField, KokyuTextField } from '@/design-system/components';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { friendlyErrorMessage } from '@/lib/api/errors';

import { leisureRoutes } from '../../constants/leisureRoutes';
import {
  buildPlanEntrySchema,
  planEntryDefaultValues,
  type PlanEntryFormValues,
} from '../../schemas/planEntrySchema';
import { leisurePlanService } from '../../services/leisurePlanService';
import type { LeisurePlanEntry } from '../../types/leisurePlan.types';
import { fromDateKey, toDateKey, todayOrLaterKey } from '../../utils/dateHelpers';

const recurrenceOptions = [
  { id: 'none', label: 'Não repetir' },
  { id: 'daily', label: 'Diariamente' },
  { id: 'weekly', label: 'Semanalmente' },
  { id: 'custom', label: 'Personalizado' },
] as const;

/**
 * Only the fields the form actually edits — never spread the full entry,
 * which also carries id/occurrenceDate/completed/createdAt. The API's own
 * type is `string | null` for an unset startTime/endTime/duration/notes
 * (a real nullable DB column) - `?? undefined` here, since the form's zod
 * schema only ever accepts `string | undefined` (`.optional()`, not
 * `.nullable()`), and an unset field left as `null` fails validation on
 * submit the moment RHF reads it back unchanged from these defaults.
 */
function mapEntryToFormValues(entry: LeisurePlanEntry): Partial<PlanEntryFormValues> {
  return {
    title: entry.title,
    date: entry.date,
    startTime: entry.startTime ?? undefined,
    endTime: entry.endTime ?? undefined,
    duration: entry.duration ?? undefined,
    recurrence: entry.recurrence,
    notes: entry.notes ?? undefined,
    reminder: entry.reminder,
  };
}

export interface PlanEntryFormPageProps {
  mode: 'create' | 'edit';
  /** Required in `edit` — the entry being edited. */
  initialEntry?: LeisurePlanEntry;
  /** `create` only — prefills the day (e.g. whichever day/week the planner was showing). */
  defaultDate?: string;
}

/**
 * `/app/tempo-livre/planejamento/nova` and `.../[id]/editar` — a full
 * page rather than `PlanEntryDialog`'s modal for Planejamento's own
 * "Planejar atividade" flow (a deliberate UX change from the modal
 * still used by the other "Planejar" entry points across Tempo Livre -
 * item detail, Lugares, Hobbies, Para depois - which weren't part of
 * this request).
 */
export function PlanEntryFormPage({ mode, initialEntry, defaultDate }: PlanEntryFormPageProps) {
  const router = useRouter();
  const { showSuccess, showError } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  // In `edit`, the entry's own date/time when the page opened - new picks
  // are held to "not in the past", but this lets an already-past plan stay
  // editable (title, notes, ...) without forcing a fresh date. `create` has
  // no reference, so every value counts as a fresh pick (see schema).
  const pastReference =
    mode === 'edit' && initialEntry
      ? { date: initialEntry.date, startTime: initialEntry.startTime, endTime: initialEntry.endTime }
      : undefined;

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<PlanEntryFormValues>({
    resolver: zodResolver(buildPlanEntrySchema(pastReference)),
    mode: 'onChange',
    defaultValues: {
      ...planEntryDefaultValues,
      ...(initialEntry
        ? mapEntryToFormValues(initialEntry)
        : { date: defaultDate ?? todayOrLaterKey(new Date()) }),
    },
  });

  // Keeps an already-past date pickable (so `mode === 'edit'` entries stay
  // visible/selected in the calendar) while still refusing any new date
  // earlier than today.
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);
  const referenceDate = pastReference?.date ? fromDateKey(pastReference.date) : undefined;
  const minDate = referenceDate && referenceDate < today ? referenceDate : today;

  // The time inputs only need a floor when the selected day is today —
  // any future day accepts any time.
  const selectedDate = useWatch({ control, name: 'date' });
  const minTime = selectedDate === toDateKey(new Date()) ? format(new Date(), 'HH:mm') : undefined;

  async function onSubmit(values: PlanEntryFormValues) {
    setIsSubmitting(true);
    try {
      if (mode === 'edit' && initialEntry) {
        await leisurePlanService.updatePlanEntry(initialEntry.id, values);
        showSuccess('Planejamento atualizado.');
      } else {
        await leisurePlanService.createPlanEntry(values);
        showSuccess('Atividade planejada.');
      }
      router.push(leisureRoutes.planner);
    } catch (error) {
      // Left open on failure (e.g. the backend's own past-date defense-in-depth
      // check rejecting a value the form itself let through) so the user can
      // correct it instead of losing it.
      showError(friendlyErrorMessage(error, 'Não foi possível salvar o planejamento agora.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleArchive() {
    if (!initialEntry) return;
    setIsArchiving(true);
    try {
      await leisurePlanService.archivePlanEntry(initialEntry.id);
      showSuccess('Planejamento arquivado. Você pode desarquivá-lo em Planejamento → Arquivados.');
      router.push(leisureRoutes.planner);
    } catch (error) {
      showError(friendlyErrorMessage(error, 'Não foi possível arquivar agora.'));
    } finally {
      setIsArchiving(false);
    }
  }

  return (
    <Stack component="form" spacing={3} onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="displaySmall" component="h1">
        {mode === 'edit' ? 'Editar planejamento' : 'Planejar atividade'}
      </Typography>

      {/*
        `alignSelf` (not `mx: 'auto'`) centers this box: the parent form
        Stack's own children-margin-reset rule (`> :not(style):not(style)
        { margin: 0 }`) outranks a plain `margin-left/right: auto` class
        on specificity, so an auto-margin approach silently loses to it.
      */}
      <Stack spacing={3} sx={{ width: '100%', maxWidth: 480, alignSelf: 'center' }}>
        <Stack spacing={2.5}>
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
                minDate={minDate}
                error={Boolean(errors.date)}
                helperText={errors.date?.message}
              />
            )}
          />
          <Stack direction="row" spacing={2}>
            <KokyuTextField
              label="Início"
              type="time"
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: minTime } }}
              sx={{ flex: 1 }}
              error={Boolean(errors.startTime)}
              helperText={errors.startTime?.message}
              {...register('startTime')}
            />
            <KokyuTextField
              label="Fim"
              type="time"
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: minTime } }}
              sx={{ flex: 1 }}
              error={Boolean(errors.endTime)}
              helperText={errors.endTime?.message}
              {...register('endTime')}
            />
          </Stack>
          <KokyuTextField
            label="Duração em minutos"
            type="number"
            slotProps={{ htmlInput: { min: 1 } }}
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

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ justifyContent: mode === 'edit' ? 'space-between' : 'flex-end' }}
        >
          {mode === 'edit' ? (
            <KokyuButton variant="text" color="error" loading={isArchiving} onClick={handleArchive}>
              Arquivar
            </KokyuButton>
          ) : null}
          <Stack direction="row" spacing={1.5}>
            <KokyuButton variant="text" onClick={() => router.push(leisureRoutes.planner)}>
              Cancelar
            </KokyuButton>
            <KokyuButton
              type="submit"
              variant="contained"
              loading={isSubmitting}
              disabled={!isValid || isSubmitting || (mode === 'edit' && !isDirty)}
            >
              Salvar
            </KokyuButton>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
