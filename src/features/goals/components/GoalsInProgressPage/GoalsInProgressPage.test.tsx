import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { resetGoalDb } from '../../services/goalMockDb';
import { GoalsInProgressPage } from './GoalsInProgressPage';

beforeEach(() => {
  resetGoalDb();
});

describe('GoalsInProgressPage', () => {
  it('lists every active goal by default', async () => {
    render(<GoalsInProgressPage />);
    expect(
      await screen.findByText('Ler 20 livros este ano', {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Construir meu aplicativo pessoal')).toBeInTheDocument();
  });

  it('never shows a completed or abandoned goal', async () => {
    render(<GoalsInProgressPage />);
    await screen.findByText('Ler 20 livros este ano');
    expect(screen.queryByText('Aprender o básico de violão')).not.toBeInTheDocument();
    expect(screen.queryByText('Aprender francês básico')).not.toBeInTheDocument();
  });

  it('filters by free-text search', async () => {
    const user = userEvent.setup();
    render(<GoalsInProgressPage />);
    await screen.findByText('Ler 20 livros este ano');

    await user.type(screen.getByLabelText('Buscar metas'), 'livros');

    await waitFor(() => {
      expect(screen.getByText('Ler 20 livros este ano')).toBeInTheDocument();
      expect(screen.queryByText('Construir meu aplicativo pessoal')).not.toBeInTheDocument();
    });
  });

  it('applies the "Foco" quick filter', async () => {
    const user = userEvent.setup();
    render(<GoalsInProgressPage />);
    await screen.findByText('Ler 20 livros este ano');

    await user.click(screen.getByRole('button', { name: 'Foco' }));

    await waitFor(() => {
      expect(screen.getByText('Ler 20 livros este ano')).toBeInTheDocument();
      expect(screen.queryByText('Treinar 4 vezes por semana')).not.toBeInTheDocument();
    });
  });
});
