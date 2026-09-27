import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiValidationError, VALIDATION_ERROR_MESSAGE } from '../../../../../test/apiErrors';
import { render, screen, waitFor, within } from '../../../../../test/test-utils';
import { leisureRoutes } from '../../constants/leisureRoutes';
import { leisureItemService } from '../../services/leisureItemService';
import { resetLeisureDb } from '../../services/leisureMockDb';
import { LeisureItemEditPage } from './LeisureItemEditPage';

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

async function renderLoaded(itemId: string) {
  render(<LeisureItemEditPage itemId={itemId} />);
  expect(await screen.findByRole('heading', { name: 'Editar item', level: 1 })).toBeInTheDocument();
}

describe('LeisureItemEditPage', () => {
  beforeEach(() => {
    resetLeisureDb();
    mockPush.mockClear();
  });

  it('is a page, not a dialog, prefilled from the item', async () => {
    await renderLoaded('book-hobbit');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toHaveValue('O Hobbit');
    expect(screen.getByLabelText('Autor')).toHaveValue('J.R.R. Tolkien');
  });

  it('saves and goes back to the item', async () => {
    const user = userEvent.setup();
    const updateSpy = vi.spyOn(leisureItemService, 'updateLeisureItem');
    await renderLoaded('book-hobbit');

    await user.clear(screen.getByLabelText('Título'));
    await user.type(screen.getByLabelText('Título'), 'O Hobbit — edição revisada');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(leisureRoutes.item('book-hobbit')));
    expect(updateSpy).toHaveBeenCalledWith(
      'book-hobbit',
      expect.objectContaining({ title: 'O Hobbit — edição revisada' }),
    );
    expect(screen.getByText('Item atualizado.')).toBeInTheDocument();
    updateSpy.mockRestore();
  });

  it('shows a pt-BR error and stays on the page with the typed data when saving fails', async () => {
    const user = userEvent.setup();
    const updateSpy = vi
      .spyOn(leisureItemService, 'updateLeisureItem')
      .mockRejectedValueOnce(apiValidationError());
    await renderLoaded('book-hobbit');

    await user.clear(screen.getByLabelText('Título'));
    await user.type(screen.getByLabelText('Título'), 'Novo título');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText(VALIDATION_ERROR_MESSAGE)).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Título')).toHaveValue('Novo título');
    updateSpy.mockRestore();
  });

  it('goes back to the item on Cancelar without saving', async () => {
    const user = userEvent.setup();
    const updateSpy = vi.spyOn(leisureItemService, 'updateLeisureItem');
    await renderLoaded('book-hobbit');

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(mockPush).toHaveBeenCalledWith(leisureRoutes.item('book-hobbit'));
    expect(updateSpy).not.toHaveBeenCalled();
    updateSpy.mockRestore();
  });

  it('archives the item after confirming, then goes back to it', async () => {
    const user = userEvent.setup();
    const archiveSpy = vi.spyOn(leisureItemService, 'archiveLeisureItem');
    await renderLoaded('movie-curta-noite');

    await user.click(screen.getByRole('button', { name: 'Arquivar' }));
    const confirm = await screen.findByRole('dialog', { name: 'Arquivar item?' });
    expect(archiveSpy).not.toHaveBeenCalled();
    await user.click(within(confirm).getByRole('button', { name: 'Arquivar' }));

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith(leisureRoutes.item('movie-curta-noite')),
    );
    expect(archiveSpy).toHaveBeenCalledWith('movie-curta-noite');
    expect(screen.getByText('Item arquivado.')).toBeInTheDocument();
    archiveSpy.mockRestore();
  });

  it('deletes the item after confirming, then goes to the library', async () => {
    const user = userEvent.setup();
    const deleteSpy = vi.spyOn(leisureItemService, 'deleteLeisureItem');
    await renderLoaded('movie-curta-noite');

    await user.click(screen.getByRole('button', { name: 'Excluir' }));
    const confirm = await screen.findByRole('dialog', { name: 'Excluir item?' });
    await user.click(within(confirm).getByRole('button', { name: 'Excluir' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(leisureRoutes.library));
    expect(deleteSpy).toHaveBeenCalledWith('movie-curta-noite');
    expect(screen.getByText('Item excluído.')).toBeInTheDocument();
    deleteSpy.mockRestore();
  });

  it('does nothing when the confirmation is cancelled', async () => {
    const user = userEvent.setup();
    const deleteSpy = vi.spyOn(leisureItemService, 'deleteLeisureItem');
    await renderLoaded('movie-curta-noite');

    await user.click(screen.getByRole('button', { name: 'Excluir' }));
    const confirm = await screen.findByRole('dialog', { name: 'Excluir item?' });
    await user.click(within(confirm).getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(deleteSpy).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
    deleteSpy.mockRestore();
  });

  it('shows a pt-BR error and stays on the page when deleting fails', async () => {
    const user = userEvent.setup();
    const deleteSpy = vi
      .spyOn(leisureItemService, 'deleteLeisureItem')
      .mockRejectedValueOnce(apiValidationError());
    await renderLoaded('movie-curta-noite');

    await user.click(screen.getByRole('button', { name: 'Excluir' }));
    const confirm = await screen.findByRole('dialog', { name: 'Excluir item?' });
    await user.click(within(confirm).getByRole('button', { name: 'Excluir' }));

    expect(await screen.findByText(VALIDATION_ERROR_MESSAGE)).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
    deleteSpy.mockRestore();
  });

  it('shows a not-found message for an unknown item', async () => {
    render(<LeisureItemEditPage itemId="missing-item" />);
    expect(await screen.findByText('Este item não foi encontrado.')).toBeInTheDocument();
  });
});
