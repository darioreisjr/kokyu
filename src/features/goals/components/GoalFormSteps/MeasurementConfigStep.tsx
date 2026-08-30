'use client';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Controller, type Control, type UseFormRegister } from 'react-hook-form';

import { KokyuButton, KokyuTextField } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { goalUnitOptions } from '../../constants/goalUnits';
import type { GoalFormValues } from '../../schemas/goalSchema';
import type { GoalKeyResult, GoalMilestone, GoalType } from '../../types';

export interface MeasurementConfigStepProps {
  type: GoalType;
  control: Control<GoalFormValues>;
  register: UseFormRegister<GoalFormValues>;
  milestones: GoalMilestone[];
  onMilestonesChange: (milestones: GoalMilestone[]) => void;
  keyResults: GoalKeyResult[];
  onKeyResultsChange: (keyResults: GoalKeyResult[]) => void;
}

function NumericFields({
  type,
  control,
  register,
}: Pick<MeasurementConfigStepProps, 'type' | 'control' | 'register'>) {
  return (
    <Stack spacing={2}>
      {type === 'numeric' ? (
        <Controller
          control={control}
          name="direction"
          render={({ field }) => (
            <KokyuTextField select label="Direção" value={field.value} onChange={field.onChange}>
              <MenuItem value="increase">Aumentar até o alvo</MenuItem>
              <MenuItem value="decrease">Reduzir até o alvo</MenuItem>
            </KokyuTextField>
          )}
        />
      ) : null}
      <Controller
        control={control}
        name="unit"
        render={({ field }) => (
          <KokyuTextField select label="Unidade" value={field.value} onChange={field.onChange}>
            {goalUnitOptions.map((unit) => (
              <MenuItem key={unit.id} value={unit.id}>
                {unit.label}
              </MenuItem>
            ))}
          </KokyuTextField>
        )}
      />
      <Stack direction="row" spacing={2}>
        <KokyuTextField
          label="Valor inicial (baseline)"
          type="number"
          sx={{ flex: 1 }}
          {...register('baseline', { valueAsNumber: true })}
        />
        <KokyuTextField
          label="Valor atual"
          type="number"
          sx={{ flex: 1 }}
          {...register('currentValue', { valueAsNumber: true })}
        />
        <KokyuTextField
          label="Alvo"
          type="number"
          sx={{ flex: 1 }}
          {...register('targetValue', { valueAsNumber: true })}
        />
      </Stack>
      {type === 'consistency' || type === 'average' ? (
        <KokyuTextField
          label="Período (dias)"
          type="number"
          {...register('periodDays', { valueAsNumber: true })}
          helperText="Ex.: 7 para uma meta semanal, 30 para uma meta mensal."
        />
      ) : null}
      <Controller
        control={control}
        name="allowOverachievement"
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(field.value)}
                onChange={(event) => field.onChange(event.target.checked)}
              />
            }
            label="Permitir superar o alvo (ex.: 22 de 20)"
          />
        )}
      />
    </Stack>
  );
}

function MilestonesEditor({
  milestones,
  onMilestonesChange,
}: Pick<MeasurementConfigStepProps, 'milestones' | 'onMilestonesChange'>) {
  const [title, setTitle] = useState('');

  function addMilestone() {
    if (!title.trim()) return;
    onMilestonesChange([
      ...milestones,
      {
        id: `draft-milestone-${Date.now()}`,
        title: title.trim(),
        completed: false,
        order: milestones.length,
      },
    ]);
    setTitle('');
  }

  function removeMilestone(id: string) {
    onMilestonesChange(milestones.filter((milestone) => milestone.id !== id));
  }

  return (
    <Stack spacing={1.5}>
      <Typography
        variant="body2"
        sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
      >
        Divida esta meta em marcos importantes — você pode ajustar depois.
      </Typography>
      <Stack spacing={1}>
        {milestones.map((milestone) => (
          <Stack
            key={milestone.id}
            direction="row"
            spacing={1}
            sx={(theme) => ({
              alignItems: 'center',
              padding: 1,
              borderRadius: 1.5,
              border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
            })}
          >
            <Typography variant="body2" sx={{ flex: 1 }}>
              {milestone.title}
            </Typography>
            <IconButton
              size="small"
              aria-label={`Remover marco ${milestone.title}`}
              onClick={() => removeMilestone(milestone.id)}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>
      <Stack direction="row" spacing={1}>
        <KokyuTextField
          label="Novo marco"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addMilestone();
            }
          }}
          sx={{ flex: 1 }}
        />
        <KokyuButton variant="outlined" onClick={addMilestone}>
          Adicionar
        </KokyuButton>
      </Stack>
    </Stack>
  );
}

function KeyResultsEditor({
  keyResults,
  onKeyResultsChange,
}: Pick<MeasurementConfigStepProps, 'keyResults' | 'onKeyResultsChange'>) {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');

  function addKeyResult() {
    if (!title.trim() || !target) return;
    onKeyResultsChange([
      ...keyResults,
      {
        id: `draft-kr-${Date.now()}`,
        title: title.trim(),
        type: 'numeric',
        baseline: 0,
        current: 0,
        target: Number(target),
        unit: 'units',
        status: 'notStarted',
      },
    ]);
    setTitle('');
    setTarget('');
  }

  function removeKeyResult(id: string) {
    onKeyResultsChange(keyResults.filter((keyResult) => keyResult.id !== id));
  }

  return (
    <Stack spacing={1.5}>
      <Typography
        variant="body2"
        sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
      >
        Metas maiores podem ter alguns resultados concretos em vez de um único número — sem peso
        definido, cada um conta igualmente.
      </Typography>
      <Stack spacing={1}>
        {keyResults.map((keyResult) => (
          <Stack
            key={keyResult.id}
            direction="row"
            spacing={1}
            sx={(theme) => ({
              alignItems: 'center',
              padding: 1,
              borderRadius: 1.5,
              border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
            })}
          >
            <Typography variant="body2" sx={{ flex: 1 }}>
              {keyResult.title} (alvo: {keyResult.target})
            </Typography>
            <IconButton
              size="small"
              aria-label={`Remover resultado ${keyResult.title}`}
              onClick={() => removeKeyResult(keyResult.id)}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>
      <Stack direction="row" spacing={1}>
        <KokyuTextField
          label="Novo resultado"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          sx={{ flex: 2 }}
        />
        <KokyuTextField
          label="Alvo"
          type="number"
          value={target}
          onChange={(event) => setTarget(event.target.value)}
          sx={{ flex: 1 }}
        />
        <KokyuButton variant="outlined" onClick={addKeyResult}>
          Adicionar
        </KokyuButton>
      </Stack>
    </Stack>
  );
}

export function MeasurementConfigStep({
  type,
  control,
  register,
  milestones,
  onMilestonesChange,
  keyResults,
  onKeyResultsChange,
}: MeasurementConfigStepProps) {
  return (
    <Stack spacing={2}>
      <Typography variant="labelLarge">Configurar medição</Typography>
      {type === 'numeric' || type === 'consistency' || type === 'average' ? (
        <NumericFields type={type} control={control} register={register} />
      ) : null}
      {type === 'binary' ? (
        <Typography
          variant="body2"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          Essa meta não precisa de número — ela só será marcada como concluída quando você decidir.
        </Typography>
      ) : null}
      {type === 'milestone' ? (
        <MilestonesEditor milestones={milestones} onMilestonesChange={onMilestonesChange} />
      ) : null}
      {type === 'keyResult' ? (
        <KeyResultsEditor keyResults={keyResults} onKeyResultsChange={onKeyResultsChange} />
      ) : null}
    </Stack>
  );
}
