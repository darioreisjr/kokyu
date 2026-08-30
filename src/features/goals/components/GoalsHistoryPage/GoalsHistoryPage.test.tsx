import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { resetGoalDb } from '../../services/goalMockDb';
import { GoalsHistoryPage } from './GoalsHistoryPage';

beforeEach(() => {
  resetGoalDb();
});

describe('GoalsHistoryPage', () => {
  it('shows the period review and the activity timeline', async () => {
    render(<GoalsHistoryPage />);
    expect(screen.getByRole('heading', { name: 'Histórico', level: 1 })).toBeInTheDocument();
    expect(await screen.findByText('Revisão dos últimos 30 dias')).toBeInTheDocument();
    expect(screen.getByText(/Meta criada\./)).toBeInTheDocument();
  });
});
