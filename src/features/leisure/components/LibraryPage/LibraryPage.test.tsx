import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen, waitFor, within } from '../../../../../test/test-utils';
import { resetLeisureDb } from '../../services/leisureMockDb';
import { LibraryPage } from './LibraryPage';

describe('LibraryPage', () => {
  beforeEach(() => {
    resetLeisureDb();
    window.localStorage.clear();
  });

  it('shows the header and lists library items, excluding places/hobbies', async () => {
    render(<LibraryPage />);
    expect(screen.getByRole('heading', { name: 'Biblioteca', level: 1 })).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('Interestelar')).toBeInTheDocument());
    expect(screen.queryByText('MASP')).not.toBeInTheDocument();
    expect(screen.queryByText('Violão')).not.toBeInTheDocument();
  });

  it('filters to books only', async () => {
    const user = userEvent.setup();
    render(<LibraryPage />);
    await waitFor(() => expect(screen.getByText('Interestelar')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Livros' }));
    await waitFor(() => expect(screen.queryByText('Interestelar')).not.toBeInTheDocument());
    expect(screen.getByText('O Hobbit')).toBeInTheDocument();
  });

  it('filters to favorites', async () => {
    const user = userEvent.setup();
    render(<LibraryPage />);
    await waitFor(() => expect(screen.getByText('Interestelar')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Favoritas' }));
    expect(screen.getByText('Interestelar')).toBeInTheDocument();
    expect(screen.queryByText('O Hobbit')).not.toBeInTheDocument();
  });

  it('searches by title', async () => {
    const user = userEvent.setup();
    render(<LibraryPage />);
    await waitFor(() => expect(screen.getByText('Interestelar')).toBeInTheDocument());

    await user.type(screen.getByLabelText('Buscar na biblioteca'), 'hobbit');
    await waitFor(() => expect(screen.queryByText('Interestelar')).not.toBeInTheDocument());
    expect(screen.getByText('O Hobbit')).toBeInTheDocument();
  });

  it('switches between grid and list view, persisting the choice', async () => {
    const user = userEvent.setup();
    render(<LibraryPage />);
    await waitFor(() => expect(screen.getByText('Interestelar')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Lista' }));
    expect(window.localStorage.getItem('kokyu:leisure:library-view-mode')).toBe('list');
  });

  it('creates a new list (collection)', async () => {
    const user = userEvent.setup();
    render(<LibraryPage />);
    await waitFor(() => expect(screen.getByText('Minhas listas')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Criar lista' }));
    const dialog = await screen.findByRole('dialog', { name: 'Nova lista' });
    await user.type(within(dialog).getByLabelText('Nome da lista'), 'Jogos curtos');
    await user.click(within(dialog).getByRole('button', { name: 'Criar' }));

    await waitFor(() => expect(screen.getByText('Lista criada.')).toBeInTheDocument());
    expect(screen.getByText('Jogos curtos (0)')).toBeInTheDocument();
  });

  it('adds a new item via the header button', async () => {
    const user = userEvent.setup();
    render(<LibraryPage />);
    await waitFor(() => expect(screen.getByText('Interestelar')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    const dialog = await screen.findByRole('dialog', { name: 'Novo item' });
    await user.type(within(dialog).getByLabelText('Título'), 'Duna');
    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(screen.getByText('Item salvo.')).toBeInTheDocument());
  });
});
