'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { KokyuButton, KokyuDateField, KokyuTextField } from '@/design-system/components';

import { useRoutines } from '../../hooks/useRoutines';
import {
  scheduleEntryFormDefaultValues,
  scheduleEntryFormSchema,
  type ScheduleEntryFormValues,
} from '../../schemas/scheduleEntrySchema';
import { trainingScheduleService } from '../../services/trainingScheduleService';
import { toDateKey } from '../../utils/dateHelpers';
import { parseOptionalNumberFieldValue } from '../../utils/numberFieldValue';

export interface ScheduleWorkoutDialogProps {
  open: boolean;
  onClose: () => void;
  onScheduled: () => void;
  /** Pre-fill the date, e.g. when opened from a specific day in the calendar. */
  initialDate?: Date;
}

const FORM_ID = 'training-schedule-workout-form';

export function ScheduleWorkoutDialog({
  open,
  onClose,
  onScheduled,
  initialDate,
}: ScheduleWorkoutDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { routines } = useRoutines();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ScheduleEntryFormValues>({
    resolver: zodResolver(scheduleEntryFormSchema),
    defaultValues: scheduleEntryFormDefaultValues,
  });

  useEffect(() => {
    if (open) reset({ ...scheduleEntryFormDefaultValues, date: initialDate ?? new Date() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function onSubmit(values: ScheduleEntryFormValues) {
    setIsSubmitting(true);
    try {
      const routine = routines.find((candidate) => candidate.id === values.routineId);
      await trainingScheduleService.scheduleWorkout({
        date: toDateKey(values.date),
        time: values.time || undefined,
        routineId: values.routineId,
        estimatedDurationMinutes:
          values.estimatedDurationMinutes ?? routine?.estimatedDurationMinutes,
        recurrence: values.recurrence,
        reminder: values.reminder,
        label: routine?.name ?? 'Treino',
      });
      onScheduled();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      aria-labelledby="schedule-workout-title"
    >
      <DialogTitle id="schedule-workout-title">Planejar treino</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id={FORM_ID}
          spacing={2}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ pt: 1 }}
        >
          <Controller
            control={control}
            name="routineId"
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.routineId)}>
                <InputLabel id="schedule-routine-label">Rotina</InputLabel>
                <Select labelId="schedule-routine-label" label="Rotina" {...field}>
                  {routines.map((routine) => (
                    <MenuItem key={routine.id} value={routine.id}>
                      {routine.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="date"
            render={({ field }) => (
              <KokyuDateField
                label="Data"
                value={field.value}
                onChange={(value) => field.onChange(value ?? new Date())}
              />
            )}
          />

          <KokyuTextField
            label="Horário (opcional)"
            type="time"
            slotProps={{ inputLabel: { shrink: true } }}
            {...register('time')}
          />

          <KokyuTextField
            label="Duração estimada (min, opcional)"
            type="number"
            {...register('estimatedDurationMinutes', { setValueAs: parseOptionalNumberFieldValue })}
          />

          <Controller
            control={control}
            name="recurrence"
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel id="schedule-recurrence-label">Repetição</InputLabel>
                <Select labelId="schedule-recurrence-label" label="Repetição" {...field}>
                  <MenuItem value="once">Uma vez</MenuItem>
                  <MenuItem value="weekly">Semanalmente</MenuItem>
                </Select>
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="reminder"
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
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
        <KokyuButton variant="text" onClick={onClose}>
          Cancelar
        </KokyuButton>
        <KokyuButton type="submit" form={FORM_ID} variant="contained" loading={isSubmitting}>
          Planejar
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
