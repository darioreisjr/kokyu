'use client';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Controller, type Control, type UseFormRegister, type UseFormWatch } from 'react-hook-form';

import { KokyuTextField } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { goalPriorityOptions } from '../../constants/goalPriorities';
import type { GoalFormValues } from '../../schemas/goalSchema';

export interface DetailsStepProps {
  control: Control<GoalFormValues>;
  register: UseFormRegister<GoalFormValues>;
  watch: UseFormWatch<GoalFormValues>;
}

function getQualityHints(values: GoalFormValues): string[] {
  const hints: string[] = [];
  if (values.title.trim().length > 0) hints.push('Título específico definido.');
  if (
    values.progressMode === 'automatic' ||
    typeof values.targetValue === 'number' ||
    values.type === 'binary' ||
    values.type === 'milestone' ||
    values.type === 'keyResult'
  ) {
    hints.push('Existe um critério de progresso mensurável.');
  }
  if (values.targetDate) hints.push('Tem um prazo definido.');
  if (values.motivation?.trim()) hints.push('Você registrou por que essa meta importa.');
  return hints;
}

/** Última etapa — prioridade, frequência de check-in, tags, motivação e critério de sucesso, com um indicador de qualidade que só orienta, nunca bloqueia (ver a spec: "não bloquear criação se Meta não for perfeitamente SMART"). */
export function DetailsStep({ control, register, watch }: DetailsStepProps) {
  const [tagInput, setTagInput] = useState('');
  const values = watch();

  return (
    <Stack spacing={2}>
      <Typography variant="labelLarge">Últimos detalhes</Typography>

      <Controller
        control={control}
        name="priority"
        render={({ field }) => (
          <KokyuTextField select label="Prioridade" value={field.value} onChange={field.onChange}>
            {goalPriorityOptions.map((priority) => (
              <MenuItem key={priority.id} value={priority.id}>
                {priority.label}
              </MenuItem>
            ))}
          </KokyuTextField>
        )}
      />

      <Controller
        control={control}
        name="checkInFrequency"
        render={({ field }) => (
          <KokyuTextField
            select
            label="Lembrete de check-in"
            value={field.value}
            onChange={field.onChange}
          >
            <MenuItem value="none">Sem lembrete</MenuItem>
            <MenuItem value="weekly">Semanal</MenuItem>
            <MenuItem value="biweekly">Quinzenal</MenuItem>
            <MenuItem value="monthly">Mensal</MenuItem>
            <MenuItem value="custom">Personalizado</MenuItem>
          </KokyuTextField>
        )}
      />

      <Controller
        control={control}
        name="tags"
        render={({ field }) => (
          <Stack spacing={1}>
            <KokyuTextField
              label="Tags (opcional)"
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && tagInput.trim()) {
                  event.preventDefault();
                  if (!field.value.includes(tagInput.trim()))
                    field.onChange([...field.value, tagInput.trim()]);
                  setTagInput('');
                }
              }}
            />
            {field.value.length > 0 ? (
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                {field.value.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    onDelete={() =>
                      field.onChange(field.value.filter((candidate) => candidate !== tag))
                    }
                    deleteIcon={<CloseRoundedIcon />}
                  />
                ))}
              </Stack>
            ) : null}
          </Stack>
        )}
      />

      <KokyuTextField
        label="Por que isso importa para você? (opcional)"
        multiline
        minRows={2}
        {...register('motivation')}
      />
      <KokyuTextField
        label="Como você saberá que atingiu esta meta? (opcional)"
        multiline
        minRows={2}
        {...register('successCriteria')}
      />

      <Stack
        spacing={0.5}
        sx={(theme) => ({
          padding: 1.5,
          borderRadius: 2,
          backgroundColor: themePalette(theme).kokyu.background.subtle,
        })}
      >
        <Typography variant="labelSmall">Sua meta está bem definida:</Typography>
        {getQualityHints(values).map((hint) => (
          <Typography
            key={hint}
            variant="labelSmall"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            · {hint}
          </Typography>
        ))}
      </Stack>
    </Stack>
  );
}
