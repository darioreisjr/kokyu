import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { resetTrainingDb, trainingDb } from '../../services/trainingMockDb';
import { PersonalRecordTable } from './PersonalRecordTable';

describe('PersonalRecordTable', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  it('shows the "no records yet" message when no rep-range PR has been set', async () => {
    render(<PersonalRecordTable weightUnit="kg" />);
    expect(
      await screen.findByText('Ainda sem recordes por faixa de repetições.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Recordes por repetições')).not.toBeInTheDocument();
  });

  it('renders one row per exercise with every recorded rep range, sorted by rep count', async () => {
    trainingDb.personalRecords.push(
      {
        id: 'pr-test-supino-6',
        exerciseId: 'exercise-supino-reto',
        recordType: 'repPR',
        value: 70,
        reps: 6,
        achievedAt: '2026-08-20T12:00:00.000Z',
        sessionId: 'session-push-a-1',
      },
      {
        id: 'pr-test-supino-1',
        exerciseId: 'exercise-supino-reto',
        recordType: 'repPR',
        value: 85,
        reps: 1,
        achievedAt: '2026-08-22T12:00:00.000Z',
        sessionId: 'session-push-a-2',
      },
    );

    render(<PersonalRecordTable weightUnit="kg" />);

    expect(
      await screen.findByRole('heading', { name: 'Recordes por repetições' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Supino reto' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '1 rep: 85kg · 6 reps: 70kg' })).toBeInTheDocument();
  });
});
