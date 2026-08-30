'use client';

import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, type Control, type UseFormSetValue } from 'react-hook-form';

import { KokyuTextField } from '@/design-system/components';

import type { GoalFormValues } from '../../schemas/goalSchema';
import { getAllGoalProgressSources } from '../../services/adapters';

export interface TrackingStepProps {
  control: Control<GoalFormValues>;
  progressMode: GoalFormValues['progressMode'];
  sourceModule: string | undefined;
  setValue: UseFormSetValue<GoalFormValues>;
}

const moduleLabels: Record<string, string> = {
  leisure: 'Tempo Livre',
  nutrition: 'Nutrição',
  habit: 'Hábitos',
  training: 'Treinamento',
  mission: 'Missões',
};

/** Only shows sources that actually exist as adapters today — never a module Metas can't really read from yet. */
export function TrackingStep({ control, progressMode, sourceModule, setValue }: TrackingStepProps) {
  const sources = getAllGoalProgressSources();
  const selectedSource = sources.find((source) => source.module === sourceModule);

  return (
    <Stack spacing={2}>
      <Typography variant="labelLarge">Como o progresso será atualizado?</Typography>
      <Controller
        control={control}
        name="progressMode"
        render={({ field }) => (
          <KokyuTextField
            select
            label="Atualização"
            value={field.value}
            onChange={(event) => {
              field.onChange(event.target.value);
              if (event.target.value === 'manual') {
                setValue('sourceModule', '');
                setValue('sourceMetricId', '');
              }
            }}
          >
            <MenuItem value="manual">Manualmente</MenuItem>
            <MenuItem value="automatic">Automaticamente, vinculado a um módulo Kokyu</MenuItem>
          </KokyuTextField>
        )}
      />

      {progressMode === 'automatic' ? (
        <>
          <Controller
            control={control}
            name="sourceModule"
            render={({ field }) => (
              <KokyuTextField
                select
                label="Fonte"
                value={field.value}
                onChange={(event) => {
                  field.onChange(event.target.value);
                  setValue('sourceMetricId', '');
                }}
              >
                {sources.map((source) => (
                  <MenuItem key={source.module} value={source.module}>
                    {moduleLabels[source.module]}
                  </MenuItem>
                ))}
              </KokyuTextField>
            )}
          />
          {selectedSource ? (
            // Picking a metric also sets `unit` to that metric's own unit — a source that reads
            // "livros concluídos" should never leave the goal reporting progress in "unidades".
            <Controller
              control={control}
              name="sourceMetricId"
              render={({ field, fieldState }) => (
                <KokyuTextField
                  select
                  label="Métrica"
                  value={field.value}
                  onChange={(event) => {
                    field.onChange(event.target.value);
                    const metric = selectedSource.metrics.find(
                      (candidate) => candidate.id === event.target.value,
                    );
                    if (metric) setValue('unit', metric.unit);
                  }}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                >
                  {selectedSource.metrics.map((metric) => (
                    <MenuItem key={metric.id} value={metric.id}>
                      {metric.label}
                    </MenuItem>
                  ))}
                </KokyuTextField>
              )}
            />
          ) : null}
        </>
      ) : null}
    </Stack>
  );
}
