import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import type { PerformedSet, WorkoutSession } from '../../types';
import { formatDurationMinutes } from '../../utils/trainingFormatting';
import { SessionSummaryCard } from './SessionSummaryCard';

const session: WorkoutSession = {
  id: 'session-test-1',
  name: 'Push A',
  startedAt: '2026-08-20T12:00:00.000Z',
  finishedAt: '2026-08-20T13:00:00.000Z',
  durationSeconds: 3480,
  sessionExercises: [],
  status: 'completed',
  newPersonalRecordIds: ['pr-1', 'pr-2'],
  createdAt: '2026-08-20T12:00:00.000Z',
  updatedAt: '2026-08-20T13:00:00.000Z',
};

const performedSets: PerformedSet[] = [
  {
    id: 'ps-1',
    sessionId: session.id,
    sessionExerciseId: 'se-1',
    setNumber: 1,
    setType: 'warmup',
    weightKg: 40,
    reps: 10,
    completed: true,
  },
  {
    id: 'ps-2',
    sessionId: session.id,
    sessionExerciseId: 'se-1',
    setNumber: 2,
    setType: 'working',
    weightKg: 70,
    reps: 6,
    completed: true,
  },
  {
    id: 'ps-3',
    sessionId: session.id,
    sessionExerciseId: 'se-1',
    setNumber: 3,
    setType: 'working',
    weightKg: 70,
    reps: 5,
    completed: true,
  },
  {
    id: 'ps-4',
    sessionId: session.id,
    sessionExerciseId: 'se-1',
    setNumber: 4,
    setType: 'working',
    weightKg: 70,
    reps: 5,
    completed: false,
  },
];

describe('SessionSummaryCard', () => {
  it('summarizes the session name, date, duration, working sets and volume, and shows the PR badge', () => {
    render(
      <SessionSummaryCard
        session={session}
        performedSets={performedSets}
        weightUnit="kg"
        onOpen={() => {}}
      />,
    );

    expect(screen.getByText('Push A')).toBeInTheDocument();
    expect(
      screen.getByText(new Date(session.startedAt).toLocaleDateString('pt-BR')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${formatDurationMinutes(3480)} · 2 séries · 770kg`),
    ).toBeInTheDocument();
    expect(screen.getByText('2 novos recordes')).toBeInTheDocument();
  });

  it('calls onOpen when the card is clicked', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(
      <SessionSummaryCard
        session={session}
        performedSets={performedSets}
        weightUnit="kg"
        onOpen={onOpen}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Push A/ }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('shows a duration placeholder and no PR badge for a session without a duration or new records', () => {
    const plainSession: WorkoutSession = {
      ...session,
      durationSeconds: undefined,
      newPersonalRecordIds: [],
    };
    render(
      <SessionSummaryCard
        session={plainSession}
        performedSets={[]}
        weightUnit="kg"
        onOpen={() => {}}
      />,
    );

    expect(screen.getByText('— · 0 séries · 0kg')).toBeInTheDocument();
    expect(screen.queryByText(/novo recorde/)).not.toBeInTheDocument();
  });

  it('uses singular wording for a single new record', () => {
    const singleRecordSession: WorkoutSession = { ...session, newPersonalRecordIds: ['pr-1'] };
    render(
      <SessionSummaryCard
        session={singleRecordSession}
        performedSets={performedSets}
        weightUnit="kg"
        onOpen={() => {}}
      />,
    );
    expect(screen.getByText('1 novo recorde')).toBeInTheDocument();
  });
});
