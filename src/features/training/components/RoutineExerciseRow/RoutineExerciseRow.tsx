'use client';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import Typography from '@mui/material/Typography';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { KokyuButton, KokyuTextField } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { cardTokens } from '@/design-system/tokens/component';

import { basicSetTypes, setTypeLabels } from '../../constants/setTypes';
import { progressionStrategyOptions } from '../../constants/progressionStrategyOptions';
import type { RoutineFormValues } from '../../schemas/routineSchema';
import { createTempId } from '../../utils/createTempId';
import { parseOptionalNumberFieldValue } from '../../utils/numberFieldValue';

export interface RoutineExerciseRowProps {
  index: number;
  exerciseName: string;
  isFirst: boolean;
  isLast: boolean;
  isGrouped: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onToggleGroupWithPrevious: () => void;
}

export function RoutineExerciseRow({
  index,
  exerciseName,
  isFirst,
  isLast,
  isGrouped,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
  onToggleGroupWithPrevious,
}: RoutineExerciseRowProps) {
  const { control, register, watch } = useFormContext<RoutineFormValues>();
  const {
    fields: setFields,
    append: appendSet,
    remove: removeSet,
  } = useFieldArray({
    control,
    name: `exercises.${index}.sets`,
  });
  const progressionStrategy = watch(`exercises.${index}.progressionStrategy`);

  function handleAddSet() {
    const lastSet = setFields[setFields.length - 1];
    appendSet({
      id: createTempId('set'),
      order: setFields.length + 1,
      setType: 'working',
      targetReps: lastSet && 'targetReps' in lastSet ? lastSet.targetReps : 8,
      targetLoadKg: lastSet && 'targetLoadKg' in lastSet ? lastSet.targetLoadKg : undefined,
      restSeconds: lastSet?.restSeconds ?? 90,
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
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {isGrouped ? (
            <LinkRoundedIcon fontSize="small" aria-label="Faz parte de um superset" />
          ) : null}
          <Typography variant="labelLarge" component="p">
            {exerciseName}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            aria-label="Mover para cima"
            onClick={onMoveUp}
            disabled={isFirst}
          >
            <ArrowUpwardRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Mover para baixo"
            onClick={onMoveDown}
            disabled={isLast}
          >
            <ArrowDownwardRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" aria-label="Duplicar exercício" onClick={onDuplicate}>
            <ContentCopyRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" aria-label="Remover exercício" onClick={onRemove}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      {!isFirst ? (
        <ToggleButton
          value="group"
          selected={isGrouped}
          onChange={onToggleGroupWithPrevious}
          size="small"
          sx={{ mt: 1 }}
          aria-label="Fazer superset com o exercício acima"
        >
          Superset com o exercício acima
        </ToggleButton>
      ) : null}

      <Stack spacing={1} sx={{ mt: 2 }}>
        {setFields.map((setField, setIndex) => (
          <Stack
            key={setField.id}
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}
          >
            <Typography variant="labelSmall" sx={{ minWidth: 20 }}>
              {setIndex + 1}
            </Typography>
            <Controller
              control={control}
              name={`exercises.${index}.sets.${setIndex}.setType`}
              render={({ field }) => (
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id={`set-type-${index}-${setIndex}`}>Tipo</InputLabel>
                  <Select labelId={`set-type-${index}-${setIndex}`} label="Tipo" {...field}>
                    {basicSetTypes.map((value) => (
                      <MenuItem key={value} value={value}>
                        {setTypeLabels[value]}
                      </MenuItem>
                    ))}
                    <MenuItem disabled>— avançado —</MenuItem>
                    {(['drop', 'backoff', 'amrap', 'failure', 'timed'] as const).map((value) => (
                      <MenuItem key={value} value={value}>
                        {setTypeLabels[value]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <KokyuTextField
              label="Reps"
              type="number"
              size="small"
              sx={{ width: 88 }}
              {...register(`exercises.${index}.sets.${setIndex}.targetReps`, {
                setValueAs: parseOptionalNumberFieldValue,
              })}
            />
            <KokyuTextField
              label="Até"
              type="number"
              size="small"
              sx={{ width: 80 }}
              {...register(`exercises.${index}.sets.${setIndex}.targetRepsMax`, {
                setValueAs: parseOptionalNumberFieldValue,
              })}
            />
            <KokyuTextField
              label="Kg"
              type="number"
              size="small"
              sx={{ width: 88 }}
              {...register(`exercises.${index}.sets.${setIndex}.targetLoadKg`, {
                setValueAs: parseOptionalNumberFieldValue,
              })}
            />
            <KokyuTextField
              label="Descanso (s)"
              type="number"
              size="small"
              sx={{ width: 110 }}
              {...register(`exercises.${index}.sets.${setIndex}.restSeconds`, {
                setValueAs: parseOptionalNumberFieldValue,
              })}
            />
            <IconButton size="small" aria-label="Remover série" onClick={() => removeSet(setIndex)}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
        <KokyuButton
          size="small"
          variant="text"
          startIcon={<AddRoundedIcon />}
          onClick={handleAddSet}
        >
          Adicionar série
        </KokyuButton>
      </Stack>

      <Stack direction="row" spacing={1.5} sx={{ mt: 2, flexWrap: 'wrap', rowGap: 1.5 }}>
        <Controller
          control={control}
          name={`exercises.${index}.progressionStrategy`}
          render={({ field }) => (
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id={`progression-${index}`}>Progressão</InputLabel>
              <Select labelId={`progression-${index}`} label="Progressão" {...field}>
                {progressionStrategyOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
        {progressionStrategy === 'linear' ? (
          <>
            <KokyuTextField
              label="Incremento (kg)"
              type="number"
              size="small"
              sx={{ width: 140 }}
              {...register(`exercises.${index}.incrementKg`, {
                setValueAs: parseOptionalNumberFieldValue,
              })}
            />
            <KokyuTextField
              label="Após N sucessos"
              type="number"
              size="small"
              sx={{ width: 140 }}
              {...register(`exercises.${index}.incrementAfterSuccesses`, {
                setValueAs: parseOptionalNumberFieldValue,
              })}
            />
          </>
        ) : null}
        {progressionStrategy === 'doubleProgression' ? (
          <>
            <KokyuTextField
              label="Faixa mínima"
              type="number"
              size="small"
              sx={{ width: 120 }}
              {...register(`exercises.${index}.repRangeMin`, {
                setValueAs: parseOptionalNumberFieldValue,
              })}
            />
            <KokyuTextField
              label="Faixa máxima"
              type="number"
              size="small"
              sx={{ width: 120 }}
              {...register(`exercises.${index}.repRangeMax`, {
                setValueAs: parseOptionalNumberFieldValue,
              })}
            />
            <KokyuTextField
              label="Incremento (kg)"
              type="number"
              size="small"
              sx={{ width: 140 }}
              {...register(`exercises.${index}.incrementKg`, {
                setValueAs: parseOptionalNumberFieldValue,
              })}
            />
          </>
        ) : null}
        {progressionStrategy === 'percentOfTrainingMax' ? (
          <>
            <KokyuTextField
              label="Training max (kg)"
              type="number"
              size="small"
              sx={{ width: 160 }}
              {...register(`exercises.${index}.trainingMaxKg`, {
                setValueAs: parseOptionalNumberFieldValue,
              })}
            />
            <KokyuTextField
              label="% do max"
              type="number"
              size="small"
              sx={{ width: 120 }}
              {...register(`exercises.${index}.percentOfMax`, {
                setValueAs: parseOptionalNumberFieldValue,
              })}
            />
          </>
        ) : null}
      </Stack>

      <KokyuTextField
        label="Notas (opcional)"
        size="small"
        fullWidth
        sx={{ mt: 1.5 }}
        {...register(`exercises.${index}.notes`)}
      />
    </Box>
  );
}
