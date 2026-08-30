'use client';

import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { trainingRoutes } from '../../constants/trainingRoutes';
import { useRoutine } from '../../hooks/useRoutine';
import { routineService } from '../../services/routineService';
import type { RoutineFormValues } from '../../schemas/routineSchema';
import { mapFormValuesToRoutineInput, mapRoutineToFormValues } from '../../utils/routineFormMapper';
import { RoutineBuilder } from '../RoutineBuilder/RoutineBuilder';

export interface RoutineFormPageProps {
  mode: 'create' | 'edit';
  routineId?: string;
}

export function RoutineFormPage({ mode, routineId }: RoutineFormPageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { status, routine } = useRoutine(mode === 'edit' ? routineId! : '__none__');

  async function handleSubmit(values: RoutineFormValues) {
    setIsSubmitting(true);
    try {
      const input = mapFormValuesToRoutineInput(values);
      if (mode === 'create') {
        const created = await routineService.createRoutine(input);
        router.push(trainingRoutes.routine(created.id));
      } else if (routineId) {
        await routineService.updateRoutine(routineId, input);
        router.push(trainingRoutes.routine(routineId));
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

  if (mode === 'edit' && !routine) {
    return <Typography variant="body1">Treino não encontrado.</Typography>;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="displaySmall" component="h1">
        {mode === 'create' ? 'Novo treino' : `Editar ${routine!.name}`}
      </Typography>
      <RoutineBuilder
        defaultValues={mode === 'edit' && routine ? mapRoutineToFormValues(routine) : undefined}
        onSubmit={handleSubmit}
        submitLabel={mode === 'create' ? 'Criar treino' : 'Salvar alterações'}
        isSubmitting={isSubmitting}
      />
    </Stack>
  );
}
