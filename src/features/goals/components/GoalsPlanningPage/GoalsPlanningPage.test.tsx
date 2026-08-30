import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { resetGoalDb } from '../../services/goalMockDb';
import { GoalsPlanningPage } from './GoalsPlanningPage';

beforeEach(() => {
  resetGoalDb();
});

describe('GoalsPlanningPage', () => {
  it('groups active goals by horizon', async () => {
    render(<GoalsPlanningPage />);
    expect(screen.getByRole('heading', { name: 'Planejamento', level: 1 })).toBeInTheDocument();
    expect(await screen.findByText('Ler 20 livros este ano')).toBeInTheDocument();
  });

  it('never shows a completed or abandoned goal', async () => {
    render(<GoalsPlanningPage />);
    await screen.findByText('Ler 20 livros este ano');
    expect(screen.queryByText('Aprender o básico de violão')).not.toBeInTheDocument();
  });
});
