import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { resetTrainingDb, trainingDb } from '../../services/trainingMockDb';
import { ProgramsPage } from './ProgramsPage';

describe('ProgramsPage', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  it('lists the seeded program with a link to create a new one', async () => {
    render(<ProgramsPage />);

    expect(screen.getByRole('heading', { name: 'Programas', level: 1 })).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('link', { name: /Hipertrofia — Fundamentos/ })).toBeInTheDocument(),
    );
    expect(screen.getByRole('link', { name: 'Novo programa' })).toHaveAttribute(
      'href',
      '/app/treinamento/programas/novo',
    );
  });

  it('shows an empty state with a call to action when there are no programs', async () => {
    trainingDb.programs = [];
    render(<ProgramsPage />);

    await waitFor(() =>
      expect(screen.getByText('Nenhum programa criado ainda.')).toBeInTheDocument(),
    );
    expect(screen.getAllByRole('link', { name: 'Novo programa' }).length).toBeGreaterThan(0);
  });
});
