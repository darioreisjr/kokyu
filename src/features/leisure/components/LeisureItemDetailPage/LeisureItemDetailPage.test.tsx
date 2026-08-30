import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor, within } from '../../../../../test/test-utils';
import { resetLeisureDb } from '../../services/leisureMockDb';
import { LeisureItemDetailPage } from './LeisureItemDetailPage';

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('LeisureItemDetailPage', () => {
  beforeEach(() => {
    resetLeisureDb();
    mockPush.mockClear();
  });

  it('shows the title, type, status and duration', async () => {
    render(<LeisureItemDetailPage itemId="movie-interestelar" />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Interestelar' })).toBeInTheDocument(),
    );
    expect(screen.getByText(/Filme · Para assistir · 2h49/)).toBeInTheDocument();
  });

  it('shows a "not found" message for an unknown item', async () => {
    render(<LeisureItemDetailPage itemId="does-not-exist" />);
    await waitFor(() => expect(screen.getByText('Item não encontrado.')).toBeInTheDocument());
  });

  it('toggles favorite', async () => {
    const user = userEvent.setup();
    render(<LeisureItemDetailPage itemId="book-hiperfoco" />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Favoritar' })).toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: 'Favoritar' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Remover dos favoritos' })).toBeInTheDocument(),
    );
  });

  it('starts an item', async () => {
    const user = userEvent.setup();
    render(<LeisureItemDetailPage itemId="movie-curta-noite" />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Começar' })).toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: 'Começar' }));
    await waitFor(() => expect(screen.getByText('Atividade iniciada.')).toBeInTheDocument());
  });

  it('shows and edits progress for a book, committing only once the field loses focus', async () => {
    const user = userEvent.setup();
    render(<LeisureItemDetailPage itemId="book-hobbit" />);
    await waitFor(() => expect(screen.getByText('190 / 310 (61%)')).toBeInTheDocument());

    const progressField = screen.getByLabelText('Página atual');
    await user.clear(progressField);
    await user.type(progressField, '200');
    // Still mid-edit — the displayed progress hasn't committed yet.
    expect(screen.getByText('190 / 310 (61%)')).toBeInTheDocument();

    await user.tab();
    await waitFor(() => expect(screen.getByText('200 / 310 (65%)')).toBeInTheDocument());
  });

  it('adds and removes the item from collections without duplicating it', async () => {
    const user = userEvent.setup();
    render(<LeisureItemDetailPage itemId="movie-interestelar" />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Interestelar' })).toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: 'Adicionar a uma lista' }));
    const dialog = await screen.findByRole('dialog', { name: 'Adicionar a uma lista' });

    // Interestelar já está em "Filmes para domingo" no mock.
    const alreadyIn = within(dialog).getByRole('checkbox', { name: 'Filmes para domingo' });
    expect(alreadyIn).toBeChecked();
    await user.click(alreadyIn);
    await waitFor(() =>
      expect(
        within(dialog).getByRole('checkbox', { name: 'Filmes para domingo' }),
      ).not.toBeChecked(),
    );

    const notYetIn = within(dialog).getByRole('checkbox', { name: 'Recomendações do João' });
    expect(notYetIn).not.toBeChecked();
    await user.click(notYetIn);
    await waitFor(() =>
      expect(within(dialog).getByRole('checkbox', { name: 'Recomendações do João' })).toBeChecked(),
    );
  });

  it('edits the item, prefilling the form from its current data', async () => {
    const user = userEvent.setup();
    render(<LeisureItemDetailPage itemId="book-hobbit" />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'O Hobbit' })).toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: 'Editar' }));
    const dialog = await screen.findByRole('dialog', { name: 'Editar item' });
    expect(within(dialog).getByLabelText('Autor')).toHaveValue('J.R.R. Tolkien');

    await user.clear(within(dialog).getByLabelText('Título'));
    await user.type(within(dialog).getByLabelText('Título'), 'O Hobbit — edição revisada');
    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(screen.getByText('Item atualizado.')).toBeInTheDocument());
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'O Hobbit — edição revisada' }),
      ).toBeInTheDocument(),
    );
  });

  it('plans the item', async () => {
    const user = userEvent.setup();
    render(<LeisureItemDetailPage itemId="movie-interestelar" />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Interestelar' })).toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: 'Planejar' }));
    const dialog = await screen.findByRole('dialog', { name: 'Planejar atividade' });
    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(screen.getByText('Atividade planejada.')).toBeInTheDocument());
  });

  it('adds a note related to the item', async () => {
    const user = userEvent.setup();
    render(<LeisureItemDetailPage itemId="movie-interestelar" />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Interestelar' })).toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: 'Adicionar nota' }));
    const dialog = await screen.findByRole('dialog', { name: 'Nova nota' });
    await user.type(within(dialog).getByLabelText('Conteúdo'), 'Prestar atenção na trilha sonora.');
    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(screen.getByText('Nota salva.')).toBeInTheDocument());
    await waitFor(() =>
      expect(screen.getByText('Prestar atenção na trilha sonora.')).toBeInTheDocument(),
    );
  });

  it('marks the item as completed, logging the occurrence', async () => {
    const user = userEvent.setup();
    render(<LeisureItemDetailPage itemId="movie-interestelar" />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Marcar como concluído' })).toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: 'Marcar como concluído' }));
    const dialog = await screen.findByRole('dialog', { name: 'Registrar experiência' });
    await user.click(within(dialog).getByRole('button', { name: 'Registrar' }));

    await waitFor(() => expect(screen.getByText('Item concluído.')).toBeInTheDocument());
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Registrar novamente' })).toBeInTheDocument(),
    );
  });

  it('archives the item after confirming', async () => {
    const user = userEvent.setup();
    render(<LeisureItemDetailPage itemId="movie-curta-noite" />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Arquivar' })).toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: 'Arquivar' }));
    const confirmDialog = await screen.findByRole('dialog', { name: 'Arquivar item?' });
    await user.click(within(confirmDialog).getByRole('button', { name: 'Arquivar' }));

    await waitFor(() => expect(screen.getByText('Item arquivado.')).toBeInTheDocument());
  });

  it('deletes the item after confirming, then navigates to the library', async () => {
    const user = userEvent.setup();
    render(<LeisureItemDetailPage itemId="movie-curta-noite" />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: 'Excluir' }));
    const confirmDialog = await screen.findByRole('dialog', { name: 'Excluir item?' });
    await user.click(within(confirmDialog).getByRole('button', { name: 'Excluir' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/app/tempo-livre/biblioteca'));
  });
});
