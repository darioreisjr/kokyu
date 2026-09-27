import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiValidationError, VALIDATION_ERROR_MESSAGE } from '../../../../../test/apiErrors';
import { leisureItemService } from '../../services/leisureItemService';
import { render, screen, waitFor, within } from '../../../../../test/test-utils';
import { leisureRoutes } from '../../constants/leisureRoutes';
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

  it('shows the estimated duration in the summary, not the minimum useful session', async () => {
    // book-hobbit is flexible with a 15 min minimum useful session and no
    // estimated duration: the summary used to show "15 min" as if it were its length.
    render(<LeisureItemDetailPage itemId="book-hobbit" />);
    const summary = await screen.findByText(/^Livro · /);

    expect(summary.textContent).not.toMatch(/min|h\d/);
  });

  it('shows the cover and actions in one column and the filled-in details in the other', async () => {
    render(<LeisureItemDetailPage itemId="book-hiperfoco" />);

    expect(await screen.findByRole('heading', { name: 'Detalhes', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Foco Total/ })).toBeInTheDocument();
    expect(screen.getByText('Autor')).toBeInTheDocument();
    expect(screen.getByText('Autor Exemplo')).toBeInTheDocument();
    expect(screen.getByText('Páginas')).toBeInTheDocument();
    expect(screen.getByText('220')).toBeInTheDocument();
    expect(within(screen.getByLabelText('Tags')).getByText('aprender')).toBeInTheDocument();
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

  it('links Editar to the edit page instead of opening a dialog', async () => {
    render(<LeisureItemDetailPage itemId="book-hobbit" />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'O Hobbit' })).toBeInTheDocument(),
    );

    expect(screen.getByRole('link', { name: 'Editar' })).toHaveAttribute(
      'href',
      leisureRoutes.itemEdit('book-hobbit'),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('plans the item', async () => {
    const user = userEvent.setup();
    render(<LeisureItemDetailPage itemId="movie-interestelar" />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Interestelar' })).toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: 'Planejar' }));
    const dialog = await screen.findByRole('dialog', { name: 'Planejar atividade' });
    // A future date so the "not in the past" rule can't make startTime/
    // endTime flaky depending on what time of day this test happens to run.
    const dayGroup = within(dialog).getByRole('group', { name: 'Dia' });
    await user.click(dayGroup.querySelector('[aria-label="Day"]') as HTMLElement);
    await user.paste('01/01/2030');
    fireEvent.change(within(dialog).getByLabelText('Início'), { target: { value: '19:00' } });
    fireEvent.change(within(dialog).getByLabelText('Fim'), { target: { value: '20:00' } });
    await user.type(within(dialog).getByLabelText('Duração em minutos'), '60');
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Salvar' })).toBeEnabled(),
    );
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

  it('no longer offers Arquivar or Excluir (they moved to the edit page)', async () => {
    render(<LeisureItemDetailPage itemId="movie-curta-noite" />);
    await waitFor(() => expect(screen.getByRole('link', { name: 'Editar' })).toBeInTheDocument());

    expect(screen.queryByRole('button', { name: 'Arquivar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Excluir' })).not.toBeInTheDocument();
  });

  it('shows a pt-BR error when toggling favorite fails', async () => {
    const user = userEvent.setup();
    const toggleSpy = vi
      .spyOn(leisureItemService, 'toggleFavorite')
      .mockRejectedValueOnce(apiValidationError());
    render(<LeisureItemDetailPage itemId="book-hiperfoco" />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Favoritar' })).toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: 'Favoritar' }));

    expect(await screen.findByText(VALIDATION_ERROR_MESSAGE)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Favoritar' })).toBeInTheDocument();
    toggleSpy.mockRestore();
  });
});
