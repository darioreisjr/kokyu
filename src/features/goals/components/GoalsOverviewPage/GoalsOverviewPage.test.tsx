import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { resetGoalDb } from '../../services/goalMockDb';
import { GoalsOverviewPage } from './GoalsOverviewPage';

beforeEach(() => {
  resetGoalDb();
});

describe('GoalsOverviewPage', () => {
  it('shows the header, summary counts and focus goals', async () => {
    render(<GoalsOverviewPage />);
    expect(screen.getByRole('heading', { name: 'Metas', level: 1 })).toBeInTheDocument();
    expect(await screen.findByText('Em andamento')).toBeInTheDocument();
    expect(screen.getByText('No ritmo')).toBeInTheDocument();
    expect(screen.getByText('Precisam de atenção')).toBeInTheDocument();
    expect(screen.getByText('Foco atual')).toBeInTheDocument();
    expect(await screen.findByText('Ler 20 livros este ano')).toBeInTheDocument();
  });

  it('shows the area breakdown', async () => {
    render(<GoalsOverviewPage />);
    expect(await screen.findByText('Áreas das suas metas')).toBeInTheDocument();
  });

  it('links "Nova meta" to the creation route', async () => {
    render(<GoalsOverviewPage />);
    const links = await screen.findAllByRole('link', { name: 'Nova meta' });
    expect(links[0]).toHaveAttribute('href', '/app/metas/nova');
  });
});
