import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import type { PerformedSet, PersonalRecordCheckResult, WorkoutSession } from '../../types';
import { WorkoutSummaryDialog } from './WorkoutSummaryDialog';

const session: WorkoutSession = {
  id: 'session-1',
  routineId: 'routine-push-a',
  name: 'Push A',
  startedAt: '2026-08-29T18:00:00.000Z',
  finishedAt: '2026-08-29T18:58:00.000Z',
  durationSeconds: 3480,
  status: 'completed',
  sessionExercises: [
    {
      id: 'se-1',
      sessionId: 'session-1',
      exerciseId: 'exercise-supino-reto',
      exerciseName: 'Supino reto',
      order: 1,
      sets: [],
    },
  ],
  createdAt: '2026-08-29T18:00:00.000Z',
  updatedAt: '2026-08-29T18:58:00.000Z',
};

const performedSets: PerformedSet[] = [
  {
    id: 'ps-1',
    sessionId: 'session-1',
    sessionExerciseId: 'se-1',
    setNumber: 1,
    setType: 'working',
    weightKg: 72.5,
    reps: 7,
    completed: true,
  },
  {
    id: 'ps-2',
    sessionId: 'session-1',
    sessionExerciseId: 'se-1',
    setNumber: 2,
    setType: 'working',
    weightKg: 72.5,
    reps: 6,
    completed: true,
  },
];

describe('WorkoutSummaryDialog', () => {
  it('shows the session name, duration, and computed volume', () => {
    render(
      <WorkoutSummaryDialog
        open
        session={session}
        performedSets={performedSets}
        newRecords={[]}
        weightUnit="kg"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Treino concluído' })).toBeInTheDocument();
    expect(screen.getByText('Push A')).toBeInTheDocument();
    expect(screen.getByText('58min')).toBeInTheDocument();
    expect(screen.getByText('942.5kg')).toBeInTheDocument();
  });

  it('lists newly achieved personal records and offers to save as routine only for routine-less sessions', async () => {
    const user = userEvent.setup();
    const onSaveAsRoutine = vi.fn();
    const freeSession: WorkoutSession = { ...session, routineId: undefined };
    const newRecords: PersonalRecordCheckResult[] = [
      {
        exerciseId: 'exercise-supino-reto',
        recordType: 'maxWeight',
        isNewRecord: true,
        previousValue: 70,
        newValue: 72.5,
      },
      {
        exerciseId: 'exercise-supino-reto',
        recordType: 'maxReps',
        isNewRecord: false,
        previousValue: 8,
        newValue: 7,
      },
    ];
    render(
      <WorkoutSummaryDialog
        open
        session={freeSession}
        performedSets={performedSets}
        newRecords={newRecords}
        weightUnit="kg"
        onClose={vi.fn()}
        onSaveAsRoutine={onSaveAsRoutine}
      />,
    );
    expect(screen.getByText('Novos recordes pessoais')).toBeInTheDocument();
    expect(screen.getByText(/Maior carga: 72.5kg/)).toBeInTheDocument();
    expect(screen.queryByText(/Mais repetições/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Salvar como rotina' }));
    expect(onSaveAsRoutine).toHaveBeenCalledTimes(1);
  });

  it('does not offer to save as routine when the session already came from one, and closes via Concluir', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <WorkoutSummaryDialog
        open
        session={session}
        performedSets={performedSets}
        newRecords={[]}
        weightUnit="kg"
        onClose={onClose}
        onSaveAsRoutine={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Salvar como rotina' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Concluir' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
