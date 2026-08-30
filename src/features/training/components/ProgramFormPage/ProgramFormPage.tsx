'use client';

import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { trainingRoutes } from '../../constants/trainingRoutes';
import { useProgram } from '../../hooks/useProgram';
import { programService } from '../../services/programService';
import type { ProgramFormValues } from '../../schemas/programSchema';
import { mapFormValuesToProgramInput, mapProgramToFormValues } from '../../utils/programFormMapper';
import { ProgramForm } from '../ProgramForm/ProgramForm';

export interface ProgramFormPageProps {
  mode: 'create' | 'edit';
  programId?: string;
}

export function ProgramFormPage({ mode, programId }: ProgramFormPageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { status, program } = useProgram(mode === 'edit' ? programId! : '__none__');

  async function handleSubmit(values: ProgramFormValues) {
    setIsSubmitting(true);
    try {
      const input = mapFormValuesToProgramInput(values);
      if (mode === 'create') {
        const created = await programService.createProgram(input);
        router.push(trainingRoutes.program(created.id));
      } else if (programId) {
        await programService.updateProgram(programId, input);
        router.push(trainingRoutes.program(programId));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (mode === 'edit' && status === 'loading') {
    return (
      <Stack spacing={2}>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rounded" height={300} />
      </Stack>
    );
  }

  if (mode === 'edit' && !program) {
    return <Typography variant="body1">Programa não encontrado.</Typography>;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="displaySmall" component="h1">
        {mode === 'create' ? 'Novo programa' : `Editar ${program!.name}`}
      </Typography>
      <ProgramForm
        defaultValues={mode === 'edit' && program ? mapProgramToFormValues(program) : undefined}
        onSubmit={handleSubmit}
        submitLabel={mode === 'create' ? 'Criar programa' : 'Salvar alterações'}
        isSubmitting={isSubmitting}
      />
    </Stack>
  );
}
