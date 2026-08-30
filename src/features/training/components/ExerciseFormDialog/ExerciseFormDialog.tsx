'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { KokyuButton, KokyuTextField } from '@/design-system/components';

import { exerciseTypeOptions, trackingTypeOptions } from '../../constants/exerciseCategories';
import { muscleGroupOptions } from '../../constants/muscleGroups';
import {
  exerciseFormDefaultValues,
  exerciseFormSchema,
  type ExerciseFormValues,
} from '../../schemas/exerciseSchema';
import { exerciseService } from '../../services/exerciseService';
import type { Exercise, MuscleGroup } from '../../types';

export interface ExerciseFormDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (exercise: Exercise) => void;
  equipmentOptions: { value: string; label: string }[];
}

const FORM_ID = 'training-exercise-form';

export function ExerciseFormDialog({
  open,
  onClose,
  onCreated,
  equipmentOptions,
}: ExerciseFormDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: exerciseFormDefaultValues,
  });

  useEffect(() => {
    if (open) reset(exerciseFormDefaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function onSubmit(values: ExerciseFormValues) {
    setIsSubmitting(true);
    try {
      const exercise = await exerciseService.createCustomExercise({
        name: values.name,
        exerciseType: values.exerciseType,
        primaryMuscles: values.primaryMuscles as MuscleGroup[],
        secondaryMuscles: values.secondaryMuscles as MuscleGroup[],
        equipmentIds: values.equipmentIds,
        trackingType: values.trackingType,
        instructions: values.instructions || undefined,
        personalNotes: values.personalNotes || undefined,
      });
      onCreated(exercise);
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
      aria-labelledby="exercise-form-title"
    >
      <DialogTitle id="exercise-form-title">Novo exercício</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id={FORM_ID}
          spacing={2}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ pt: 1 }}
        >
          <KokyuTextField
            label="Nome"
            required
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            {...register('name')}
          />

          <Controller
            control={control}
            name="exerciseType"
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel id="exercise-form-type-label">Tipo</InputLabel>
                <Select labelId="exercise-form-type-label" label="Tipo" {...field}>
                  {exerciseTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="primaryMuscles"
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.primaryMuscles)}>
                <InputLabel id="exercise-form-primary-muscles-label">
                  Músculos principais
                </InputLabel>
                <Select
                  labelId="exercise-form-primary-muscles-label"
                  label="Músculos principais"
                  multiple
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(
                      typeof event.target.value === 'string'
                        ? event.target.value.split(',')
                        : event.target.value,
                    )
                  }
                  renderValue={(selected) =>
                    (selected as string[])
                      .map(
                        (value) =>
                          muscleGroupOptions.find((option) => option.value === value)?.label,
                      )
                      .join(', ')
                  }
                >
                  {muscleGroupOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.primaryMuscles ? (
                  <FormHelperText>{errors.primaryMuscles.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="secondaryMuscles"
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel id="exercise-form-secondary-muscles-label">
                  Músculos secundários
                </InputLabel>
                <Select
                  labelId="exercise-form-secondary-muscles-label"
                  label="Músculos secundários"
                  multiple
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(
                      typeof event.target.value === 'string'
                        ? event.target.value.split(',')
                        : event.target.value,
                    )
                  }
                  renderValue={(selected) =>
                    (selected as string[])
                      .map(
                        (value) =>
                          muscleGroupOptions.find((option) => option.value === value)?.label,
                      )
                      .join(', ')
                  }
                >
                  {muscleGroupOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="equipmentIds"
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel id="exercise-form-equipment-label">Equipamento</InputLabel>
                <Select
                  labelId="exercise-form-equipment-label"
                  label="Equipamento"
                  multiple
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(
                      typeof event.target.value === 'string'
                        ? event.target.value.split(',')
                        : event.target.value,
                    )
                  }
                  renderValue={(selected) =>
                    (selected as string[])
                      .map(
                        (value) => equipmentOptions.find((option) => option.value === value)?.label,
                      )
                      .join(', ')
                  }
                >
                  {equipmentOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="trackingType"
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel id="exercise-form-tracking-label">Como registrar</InputLabel>
                <Select labelId="exercise-form-tracking-label" label="Como registrar" {...field}>
                  {trackingTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          <KokyuTextField
            label="Instruções (opcional)"
            multiline
            minRows={2}
            {...register('instructions')}
          />
          <KokyuTextField
            label="Notas pessoais (opcional)"
            multiline
            minRows={2}
            {...register('personalNotes')}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <KokyuButton variant="text" onClick={onClose}>
          Cancelar
        </KokyuButton>
        <KokyuButton type="submit" form={FORM_ID} variant="contained" loading={isSubmitting}>
          Criar exercício
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
