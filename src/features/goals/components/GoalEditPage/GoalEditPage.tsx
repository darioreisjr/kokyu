'use client';

import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

import { useGoal } from '../../hooks/useGoal';
import { GoalFormPage } from '../GoalFormPage/GoalFormPage';

export interface GoalEditPageProps {
  goalId: string;
}

export function GoalEditPage({ goalId }: GoalEditPageProps) {
  const { status, goal } = useGoal(goalId);

  if (status === 'loading') {
    return (
      <Stack spacing={3} sx={{ maxWidth: 640 }}>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rounded" height={320} />
      </Stack>
    );
  }

  if (status === 'error' || !goal) {
    return (
      <Alert severity="error">Não foi possível carregar esta meta agora. Tente novamente.</Alert>
    );
  }

  return <GoalFormPage mode="edit" initialGoal={goal} />;
}
