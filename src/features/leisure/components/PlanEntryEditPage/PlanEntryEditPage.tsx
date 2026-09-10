'use client';

import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

import { usePlanEntry } from '../../hooks/usePlanEntry';
import { PlanEntryFormPage } from '../PlanEntryFormPage/PlanEntryFormPage';

export interface PlanEntryEditPageProps {
  planEntryId: string;
}

export function PlanEntryEditPage({ planEntryId }: PlanEntryEditPageProps) {
  const { status, entry } = usePlanEntry(planEntryId);

  if (status === 'loading') {
    return (
      <Stack spacing={3} sx={{ maxWidth: 480 }}>
        <Skeleton variant="text" width={220} height={40} />
        <Skeleton variant="rounded" height={420} />
      </Stack>
    );
  }

  if (status === 'error' || !entry) {
    return (
      <Alert severity="error">
        Não foi possível carregar este planejamento agora. Tente novamente.
      </Alert>
    );
  }

  return <PlanEntryFormPage mode="edit" initialEntry={entry} />;
}
