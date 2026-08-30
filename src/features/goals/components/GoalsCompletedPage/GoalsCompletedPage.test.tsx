import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { resetGoalDb } from '../../services/goalMockDb';
import { GoalsCompletedPage } from './GoalsCompletedPage';

beforeEach(() => {
  resetGoalDb();
});

describe('GoalsCompletedPage', () => {
  it('lists completed goals with area, date and duration', async () => {
    render(<GoalsCompletedPage />);
    expect(screen.getByRole('heading', { name: 'Concluídas', level: 1 })).toBeInTheDocument();
    expect(await screen.findByText('Aprender o básico de violão')).toBeInTheDocument();
  });

  it('never shows an active goal', async () => {
    render(<GoalsCompletedPage />);
    await screen.findByText('Aprender o básico de violão');
    expect(screen.queryByText('Ler 20 livros este ano')).not.toBeInTheDocument();
  });
});
