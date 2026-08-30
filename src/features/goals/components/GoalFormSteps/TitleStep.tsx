'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { KokyuTextField } from '@/design-system/components';

import type { GoalFormValues } from '../../schemas/goalSchema';

export interface TitleStepProps {
  register: UseFormRegister<GoalFormValues>;
  errors: FieldErrors<GoalFormValues>;
}

export function TitleStep({ register, errors }: TitleStepProps) {
  return (
    <Stack spacing={2}>
      <Typography variant="labelLarge">O que você quer alcançar?</Typography>
      <KokyuTextField
        label="Título"
        placeholder="Ex.: Ler 20 livros este ano"
        error={Boolean(errors.title)}
        helperText={errors.title?.message}
        autoFocus
        {...register('title')}
      />
      <KokyuTextField
        label="Descrição (opcional)"
        multiline
        minRows={2}
        {...register('description')}
      />
    </Stack>
  );
}
