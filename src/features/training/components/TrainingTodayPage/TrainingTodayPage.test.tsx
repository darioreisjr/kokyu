import { describe, expect, it, beforeEach, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { TrainingSessionProvider } from '../../providers/TrainingSessionProvider';
import { trainingScheduleService } from '../../services/trainingScheduleService';
import { resetTrainingDb, trainingDb } from '../../services/trainingMockDb';
import { toDateKey } from '../../utils/dateHelpers';
import { TrainingTodayPage } from './TrainingTodayPage';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: () => {} }),
}));

function renderToday() {
  return render(
    <TrainingSessionProvider>
      <TrainingTodayPage />
    </TrainingSessionProvider>,
  );
}

describe('TrainingTodayPage', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  it('shows the seeded planned entry for today as the startable workout', async () => {
    renderToday();
    await waitFor(() => expect(screen.getByText('Treino de hoje')).toBeInTheDocument());
    expect(screen.getByText('Pull A')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar treino' })).toBeInTheDocument();
  });

  it('never re-surfaces a skipped entry as startable, even when it is still the only entry for today', async () => {
    const todayKey = toDateKey(new Date());
    const [todayEntry] = trainingDb.scheduleEntries.filter((entry) => entry.date === todayKey);
    await trainingScheduleService.skipScheduledWorkout(todayEntry!.id);

    renderToday();
    await waitFor(() =>
      expect(screen.getByText('Nenhum treino planejado para hoje.')).toBeInTheDocument(),
    );
    expect(screen.queryByRole('button', { name: 'Iniciar treino' })).not.toBeInTheDocument();
  });

  it('prefers a still-planned entry over an already-skipped one when both land on today', async () => {
    const todayKey = toDateKey(new Date());
    const [existingTodayEntry] = trainingDb.scheduleEntries.filter(
      (entry) => entry.date === todayKey,
    );
    await trainingScheduleService.skipScheduledWorkout(existingTodayEntry!.id);
    await trainingScheduleService.scheduleWorkout({
      date: todayKey,
      routineId: 'routine-legs-a',
      recurrence: 'once',
      label: 'Legs A',
    });

    renderToday();
    await waitFor(() => expect(screen.getByText('Treino de hoje')).toBeInTheDocument());
    expect(screen.getByText('Legs A')).toBeInTheDocument();
    expect(screen.queryByText('Pull A')).not.toBeInTheDocument();
  });
});
