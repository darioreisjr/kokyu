'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import { useMemo, useState } from 'react';
import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form';

import { KokyuButton, KokyuTextField } from '@/design-system/components';

import { useExercises } from '../../hooks/useExercises';
import { useTrainingLocations } from '../../hooks/useTrainingLocations';
import {
  routineFormDefaultValues,
  routineFormSchema,
  type RoutineFormValues,
} from '../../schemas/routineSchema';
import type { Exercise } from '../../types';
import { createTempId } from '../../utils/createTempId';
import { parseOptionalNumberFieldValue } from '../../utils/numberFieldValue';
import { ExercisePickerDialog } from '../ExercisePickerDialog/ExercisePickerDialog';
import { RoutineExerciseRow } from '../RoutineExerciseRow/RoutineExerciseRow';

export interface RoutineBuilderProps {
  defaultValues?: RoutineFormValues;
  onSubmit: (values: RoutineFormValues) => Promise<void>;
  submitLabel: string;
  isSubmitting?: boolean;
}

const FORM_ID = 'training-routine-builder-form';

export function RoutineBuilder({
  defaultValues,
  onSubmit,
  submitLabel,
  isSubmitting,
}: RoutineBuilderProps) {
  const { exercises } = useExercises();
  const { locations } = useTrainingLocations();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const methods = useForm<RoutineFormValues>({
    resolver: zodResolver(routineFormSchema),
    defaultValues: defaultValues ?? routineFormDefaultValues,
  });
  const { control, register, handleSubmit, getValues, setValue, formState } = methods;
  const { fields, append, remove, swap, insert } = useFieldArray({ control, name: 'exercises' });

  const exerciseNameById = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise.name] as const)),
    [exercises],
  );

  function handlePickExercise(exercise: Exercise) {
    append({
      id: createTempId('routine-exercise'),
      exerciseId: exercise.id,
      order: fields.length + 1,
      progressionStrategy: 'manual',
      sets: [
        { id: createTempId('set'), order: 1, setType: 'working', targetReps: 8, restSeconds: 90 },
      ],
    });
    setIsPickerOpen(false);
  }

  function handleDuplicate(index: number) {
    const current = getValues(`exercises.${index}`);
    insert(index + 1, {
      ...current,
      id: createTempId('routine-exercise'),
      groupId: undefined,
      sets: current.sets.map((set) => ({ ...set, id: createTempId('set') })),
    });
  }

  function handleToggleGroupWithPrevious(index: number) {
    const previous = getValues(`exercises.${index - 1}`);
    const current = getValues(`exercises.${index}`);
    if (current.groupId && current.groupId === previous.groupId) {
      setValue(`exercises.${index}.groupId`, undefined);
      return;
    }
    const groupId = previous.groupId ?? createTempId('group');
    if (!previous.groupId) setValue(`exercises.${index - 1}.groupId`, groupId);
    setValue(`exercises.${index}.groupId`, groupId);
  }

  const submitHandler = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <FormProvider {...methods}>
      <Stack component="form" id={FORM_ID} spacing={3} onSubmit={submitHandler} noValidate>
        <KokyuTextField
          label="Nome"
          required
          error={Boolean(formState.errors.name)}
          helperText={formState.errors.name?.message}
          {...register('name')}
        />
        <KokyuTextField
          label="Descrição (opcional)"
          multiline
          minRows={2}
          {...register('description')}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Controller
            control={control}
            name="goal"
            render={({ field }) => (
              <FormControl fullWidth size="small">
                <InputLabel id="routine-goal-label">Objetivo (opcional)</InputLabel>
                <Select
                  labelId="routine-goal-label"
                  label="Objetivo (opcional)"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                >
                  <MenuItem value="">Nenhum</MenuItem>
                  <MenuItem value="strength">Força</MenuItem>
                  <MenuItem value="hypertrophy">Hipertrofia</MenuItem>
                  <MenuItem value="conditioning">Condicionamento</MenuItem>
                  <MenuItem value="muscularEndurance">Resistência muscular</MenuItem>
                  <MenuItem value="general">Geral</MenuItem>
                  <MenuItem value="custom">Personalizado</MenuItem>
                </Select>
              </FormControl>
            )}
          />
          <KokyuTextField
            label="Duração estimada (min)"
            type="number"
            size="small"
            fullWidth
            {...register('estimatedDurationMinutes', { setValueAs: parseOptionalNumberFieldValue })}
          />
          <Controller
            control={control}
            name="locationId"
            render={({ field }) => (
              <FormControl fullWidth size="small">
                <InputLabel id="routine-location-label">Local (opcional)</InputLabel>
                <Select
                  labelId="routine-location-label"
                  label="Local (opcional)"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                >
                  <MenuItem value="">Nenhum</MenuItem>
                  {locations.map((location) => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Stack>

        <Stack spacing={2}>
          {fields.map((field, index) => (
            <RoutineExerciseRow
              key={field.id}
              index={index}
              exerciseName={exerciseNameById.get(field.exerciseId) ?? 'Exercício'}
              isFirst={index === 0}
              isLast={index === fields.length - 1}
              isGrouped={Boolean(field.groupId)}
              onMoveUp={() => swap(index, index - 1)}
              onMoveDown={() => swap(index, index + 1)}
              onDuplicate={() => handleDuplicate(index)}
              onRemove={() => remove(index)}
              onToggleGroupWithPrevious={() => handleToggleGroupWithPrevious(index)}
            />
          ))}
          {formState.errors.exercises?.message ? (
            <FormHelperText error>{formState.errors.exercises.message}</FormHelperText>
          ) : null}
          <KokyuButton
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={() => setIsPickerOpen(true)}
          >
            Adicionar exercício
          </KokyuButton>
        </Stack>

        <KokyuButton
          type="submit"
          variant="contained"
          loading={isSubmitting}
          sx={{ alignSelf: 'flex-start' }}
        >
          {submitLabel}
        </KokyuButton>
      </Stack>

      <ExercisePickerDialog
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handlePickExercise}
      />
    </FormProvider>
  );
}
