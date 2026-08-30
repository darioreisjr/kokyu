import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen, waitFor, within } from '../../../../../test/test-utils';
import { resetTrainingDb } from '../../services/trainingMockDb';
import { RoutinesPage } from './RoutinesPage';

beforeEach(() => {
  resetTrainingDb();
});

describe('RoutinesPage', () => {
  it('shows the header, the "Novo treino" link and every seeded routine once loaded', async () => {
    render(<RoutinesPage />);
    expect(screen.getByRole('heading', { name: 'Meus treinos', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Novo treino' })).toHaveAttribute(
      'href',
      '/app/treinamento/treinos/novo',
    );

    expect(await screen.findByText('Push A')).toBeInTheDocument();
    expect(screen.getByText('Pull A')).toBeInTheDocument();
    expect(screen.getByText('Legs A')).toBeInTheDocument();
    expect(screen.getByText('Full Body')).toBeInTheDocument();
    expect(screen.getByText('Treino de casa')).toBeInTheDocument();
  });

  it('filters the list down to a single routine when searching', async () => {
    const user = userEvent.setup();
    render(<RoutinesPage />);
    await screen.findByText('Push A');

    await user.type(screen.getByLabelText('Buscar treinos'), 'Push');

    await waitFor(() => expect(screen.queryByText('Pull A')).not.toBeInTheDocument());
    expect(screen.getByText('Push A')).toBeInTheDocument();
  });

  it('shows an empty state with a call to action when no routine matches the search', async () => {
    const user = userEvent.setup();
    render(<RoutinesPage />);
    await screen.findByText('Push A');

    await user.type(screen.getByLabelText('Buscar treinos'), 'treino-que-nao-existe');

    expect(await screen.findByText('Nenhum treino encontrado.')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Novo treino' }).length).toBeGreaterThan(0);
  });

  it('toggles favorite state for a non-favorited routine', async () => {
    const user = userEvent.setup();
    render(<RoutinesPage />);
    await screen.findByText('Push A');

    // Push A and Pull A are already favorited in the seed data — 3 routines start out unfavorited.
    expect(screen.getAllByRole('button', { name: 'Adicionar aos favoritos' })).toHaveLength(3);

    // Legs A is the first non-favorited seeded routine.
    await user.click(screen.getAllByRole('button', { name: 'Adicionar aos favoritos' })[0]!);

    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: 'Remover dos favoritos' })).toHaveLength(3),
    );
    expect(screen.getAllByRole('button', { name: 'Adicionar aos favoritos' })).toHaveLength(2);
  });

  it('duplicates a routine and shows the copy in the list', async () => {
    const user = userEvent.setup();
    render(<RoutinesPage />);
    await screen.findByText('Legs A');

    await user.click(screen.getAllByRole('button', { name: 'Duplicar' })[2]!);

    expect(await screen.findByText('Legs A (cópia)')).toBeInTheDocument();
  });

  it('archives a routine after confirming, removing it from the default list', async () => {
    const user = userEvent.setup();
    render(<RoutinesPage />);
    await screen.findByText('Treino de casa');

    await user.click(screen.getAllByRole('button', { name: 'Arquivar' })[4]!);

    const dialog = await screen.findByRole('dialog', { name: 'Arquivar treino' });
    await user.click(within(dialog).getByRole('button', { name: 'Arquivar' }));

    await waitFor(() => expect(screen.queryByText('Treino de casa')).not.toBeInTheDocument());
  });
});
