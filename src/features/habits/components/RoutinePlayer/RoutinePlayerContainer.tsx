'use client';

import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import { useRouter } from 'next/navigation';

import { habitRoutes } from '../../constants/habitRoutes';
import { useRoutine } from '../../hooks/useRoutine';
import { habitService } from '../../services/habitService';
import { RoutinePlayer } from './RoutinePlayer';

export interface RoutinePlayerContainerProps {
  routineId: string;
}

export function RoutinePlayerContainer({ routineId }: RoutinePlayerContainerProps) {
  const router = useRouter();
  const { routine, habits, isLoading } = useRoutine(routineId);

  if (isLoading || !routine) {
    return (
      <Container sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  const handleCompleteHabit = async (habitId: string, loggedValue: number = 1) => {
    const today = new Date().toISOString().split('T')[0]!;
    await habitService.createHabitLog({
      habitId,
      date: today,
      timestamp: new Date().toISOString(),
      status: 'completed',
      value: loggedValue,
      source: 'manual',
    });
  };

  const handleFinishRoutine = () => {
    router.push(habitRoutes.today);
  };

  return (
    <RoutinePlayer
      routine={routine}
      habits={habits}
      onCompleteHabit={handleCompleteHabit}
      onFinishRoutine={handleFinishRoutine}
    />
  );
}
