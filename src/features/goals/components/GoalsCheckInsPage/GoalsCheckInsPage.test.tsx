import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { goalDb, resetGoalDb } from '../../services/goalMockDb';
import { goalService } from '../../services/goalService';
import { GoalsCheckInsPage } from './GoalsCheckInsPage';

beforeEach(() => {
  resetGoalDb();
});

describe('GoalsCheckInsPage', () => {
  it('shows an empty state when nothing is overdue', async () => {
    // The seeded goals' `createdAt` timestamps are far enough in the past (relative to the real
    // clock) that several are naturally overdue — clearing the DB is the only deterministic way
    // to exercise the true empty state.
    goalDb.goals = [];
    render(<GoalsCheckInsPage />);
    expect(screen.getByRole('heading', { name: 'Check-ins', level: 1 })).toBeInTheDocument();
    expect(await screen.findByText('Nenhuma meta precisa de revisão.')).toBeInTheDocument();
  });

  it('lists a goal once its check-in interval has elapsed and lets the user check in', async () => {
    goalDb.goals = [];
    const goal = await goalService.createGoal({
      title: 'Meta atrasada para check-in',
      area: 'personal',
      type: 'numeric',
      priority: 'medium',
      measurement: {
        type: 'numeric',
        direction: 'increase',
        unit: 'units',
        baseline: 0,
        currentValue: 0,
        targetValue: 10,
      },
      progressMode: 'manual',
      startDate: '2020-01-01',
      tags: [],
      checkInFrequency: 'weekly',
    });
    // `createGoal` always stamps `createdAt` as "now" — backdating it directly is the only way to
    // simulate a goal whose weekly check-in interval has already elapsed.
    const stored = goalDb.goals.find((candidate) => candidate.id === goal.id)!;
    stored.createdAt = '2020-01-01T00:00:00.000Z';

    const user = userEvent.setup();
    render(<GoalsCheckInsPage />);

    expect(await screen.findByText('Meta atrasada para check-in')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Fazer check-in' }));
    await user.click(await screen.findByRole('button', { name: 'No ritmo' }));
    await user.click(screen.getByRole('button', { name: 'Salvar check-in' }));

    await waitFor(async () => {
      const checkIns = await goalService.getCheckIns(goal.id);
      expect(checkIns.length).toBeGreaterThan(0);
    });
  });
});
