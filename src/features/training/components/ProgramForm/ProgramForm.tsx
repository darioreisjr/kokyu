'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { Controller, FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';

import { KokyuButton, KokyuTextField } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { cardTokens } from '@/design-system/tokens/component';

import { trainingBlockTypeOptions, weekdayShortLabels } from '../../constants/programLabels';
import { useRoutines } from '../../hooks/useRoutines';
import {
  programFormDefaultValues,
  programFormSchema,
  type ProgramFormValues,
} from '../../schemas/programSchema';
import { createTempId } from '../../utils/createTempId';
import { parseOptionalNumberFieldValue } from '../../utils/numberFieldValue';

export interface ProgramFormProps {
  defaultValues?: ProgramFormValues;
  onSubmit: (values: ProgramFormValues) => Promise<void>;
  submitLabel: string;
  isSubmitting?: boolean;
}

const FORM_ID = 'training-program-form';

function ProgramWeekRow({
  blockIndex,
  weekIndex,
  onRemove,
}: {
  blockIndex: number;
  weekIndex: number;
  onRemove: () => void;
}) {
  const { control, register } = useFormContext<ProgramFormValues>();
  const { routines } = useRoutines();

  return (
    <Stack
      spacing={1}
      sx={(theme) => ({
        borderRadius: cardTokens.radius,
        border: `1px dashed ${themePalette(theme).kokyu.border.subtle}`,
        padding: 1.5,
      })}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Typography variant="labelMedium">Semana {weekIndex + 1}</Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="labelSmall">Deload</Typography>
          <Controller
            control={control}
            name={`blocks.${blockIndex}.weeks.${weekIndex}.isDeload`}
            render={({ field }) => (
              <Switch
                size="small"
                checked={field.value}
                onChange={(event) => field.onChange(event.target.checked)}
              />
            )}
          />
          <IconButton size="small" aria-label="Remover semana" onClick={onRemove}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
      <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
        {weekdayShortLabels.map((label, weekday) => (
          <Controller
            key={weekday}
            control={control}
            name={`blocks.${blockIndex}.weeks.${weekIndex}.weekdayRoutineIds.${weekday}`}
            render={({ field }) => (
              <FormControl size="small" sx={{ minWidth: 96 }}>
                <InputLabel id={`week-${blockIndex}-${weekIndex}-${weekday}`}>{label}</InputLabel>
                <Select
                  labelId={`week-${blockIndex}-${weekIndex}-${weekday}`}
                  label={label}
                  value={field.value ?? ''}
                  onChange={(event) => field.onChange(event.target.value || null)}
                >
                  <MenuItem value="">Descanso</MenuItem>
                  {routines.map((routine) => (
                    <MenuItem key={routine.id} value={routine.id}>
                      {routine.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        ))}
      </Stack>
      <input type="hidden" {...register(`blocks.${blockIndex}.weeks.${weekIndex}.id`)} />
      <input
        type="hidden"
        {...register(`blocks.${blockIndex}.weeks.${weekIndex}.order`, {
          setValueAs: parseOptionalNumberFieldValue,
        })}
      />
    </Stack>
  );
}

function ProgramBlockRow({ index, onRemove }: { index: number; onRemove: () => void }) {
  const { control, register } = useFormContext<ProgramFormValues>();
  const {
    fields: weekFields,
    append: appendWeek,
    remove: removeWeek,
  } = useFieldArray({ control, name: `blocks.${index}.weeks` });

  function handleAddWeek() {
    appendWeek({
      id: createTempId('week'),
      order: weekFields.length + 1,
      isDeload: false,
      weekdayRoutineIds: [null, null, null, null, null, null, null],
    });
  }

  return (
    <Box
      sx={(theme) => ({
        borderRadius: cardTokens.radius,
        border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        padding: 2,
      })}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', mb: 2 }}>
        <KokyuTextField
          label="Nome do bloco"
          size="small"
          fullWidth
          {...register(`blocks.${index}.name`)}
        />
        <Controller
          control={control}
          name={`blocks.${index}.type`}
          render={({ field }) => (
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id={`block-type-${index}`}>Tipo</InputLabel>
              <Select labelId={`block-type-${index}`} label="Tipo" {...field}>
                {trainingBlockTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
        <IconButton size="small" aria-label="Remover bloco" onClick={onRemove}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Stack spacing={1.5}>
        {weekFields.map((weekField, weekIndex) => (
          <ProgramWeekRow
            key={weekField.id}
            blockIndex={index}
            weekIndex={weekIndex}
            onRemove={() => removeWeek(weekIndex)}
          />
        ))}
        <KokyuButton
          size="small"
          variant="text"
          startIcon={<AddRoundedIcon />}
          onClick={handleAddWeek}
        >
          Adicionar semana
        </KokyuButton>
      </Stack>
    </Box>
  );
}

export function ProgramForm({
  defaultValues,
  onSubmit,
  submitLabel,
  isSubmitting,
}: ProgramFormProps) {
  const methods = useForm<ProgramFormValues>({
    resolver: zodResolver(programFormSchema),
    defaultValues: defaultValues ?? programFormDefaultValues,
  });
  const { control, register, handleSubmit, formState } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'blocks' });

  function handleAddBlock() {
    append({
      id: createTempId('block'),
      name: `Bloco ${fields.length + 1}`,
      order: fields.length + 1,
      type: 'base',
      weeks: [],
    });
  }

  const submitHandler = handleSubmit(async (values) => onSubmit(values));

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
          <KokyuTextField
            label="Duração (semanas)"
            type="number"
            size="small"
            fullWidth
            error={Boolean(formState.errors.durationWeeks)}
            helperText={formState.errors.durationWeeks?.message}
            {...register('durationWeeks', { setValueAs: parseOptionalNumberFieldValue })}
          />
          <KokyuTextField
            label="Dias por semana (opcional)"
            type="number"
            size="small"
            fullWidth
            {...register('daysPerWeek', { setValueAs: parseOptionalNumberFieldValue })}
          />
        </Stack>

        <Stack spacing={2}>
          <Typography variant="labelLarge" component="h2">
            Blocos
          </Typography>
          {fields.map((field, index) => (
            <ProgramBlockRow key={field.id} index={index} onRemove={() => remove(index)} />
          ))}
          {formState.errors.blocks?.message ? (
            <FormHelperText error>{formState.errors.blocks.message}</FormHelperText>
          ) : null}
          <KokyuButton variant="outlined" startIcon={<AddRoundedIcon />} onClick={handleAddBlock}>
            Adicionar bloco
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
    </FormProvider>
  );
}
