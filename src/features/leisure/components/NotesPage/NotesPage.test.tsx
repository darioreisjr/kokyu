import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiValidationError, VALIDATION_ERROR_MESSAGE } from '../../../../../test/apiErrors';
import { render, screen, waitFor, within } from '../../../../../test/test-utils';
import { leisureRoutes } from '../../constants/leisureRoutes';
import { resetLeisureDb } from '../../services/leisureMockDb';
import { noteService } from '../../services/noteService';
import { NotesPage } from './NotesPage';

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('NotesPage', () => {
  beforeEach(() => {
    resetLeisureDb();
    mockPush.mockClear();
  });

  it('shows the header and existing notes, pinned first', async () => {
    render(<NotesPage />);
    expect(screen.getByRole('heading', { name: 'Notas', level: 1 })).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText('Coisas para levar para a praia')).toBeInTheDocument(),
    );
  });

  it('shows the related item title for a note linked to a LeisureItem', async () => {
    render(<NotesPage />);
    await waitFor(() => expect(screen.getByText(/Texto · Interestelar/)).toBeInTheDocument());
  });

  it('navigates to the new-note page instead of opening a dialog', async () => {
    const user = userEvent.setup();
    render(<NotesPage />);
    await waitFor(() =>
      expect(screen.getByText('Coisas para levar para a praia')).toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: 'Nova nota' }));

    expect(mockPush).toHaveBeenCalledWith(leisureRoutes.noteNew);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('pins and unpins a note', async () => {
    const user = userEvent.setup();
    render(<NotesPage />);
    await waitFor(() =>
      expect(screen.getByText('Coisas para levar para a praia')).toBeInTheDocument(),
    );

    const card = screen
      .getByText('Coisas para levar para a praia')
      .closest('.MuiPaper-root') as HTMLElement;
    await user.click(within(card).getByRole('button', { name: 'Desafixar nota' }));
    await waitFor(() =>
      expect(within(card).getByRole('button', { name: 'Fixar nota' })).toBeInTheDocument(),
    );
  });

  it('toggles a checklist item', async () => {
    const user = userEvent.setup();
    render(<NotesPage />);
    await waitFor(() => expect(screen.getByText('Cadeira')).toBeInTheDocument());

    const checkbox = screen.getByRole('checkbox', { name: 'Marcar Cadeira como concluído' });
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    await waitFor(() =>
      expect(screen.getByRole('checkbox', { name: 'Marcar Cadeira como concluído' })).toBeChecked(),
    );
  });

  it('opens a detail popup when a note is clicked, with Fechar and Editar', async () => {
    const user = userEvent.setup();
    render(<NotesPage />);
    await waitFor(() => expect(screen.getByText('Recomendação do João')).toBeInTheDocument());

    await user.click(screen.getByText('Recomendação do João'));

    const dialog = await screen.findByRole('dialog', { name: 'Recomendação do João' });
    expect(mockPush).not.toHaveBeenCalled();
    expect(
      within(dialog).getByText('Ele disse que o restaurante novo do centro vale muito a pena.'),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: 'Editar' })).toHaveAttribute(
      'href',
      leisureRoutes.noteEdit('note-recomendacao-joao'),
    );

    await user.click(within(dialog).getByRole('button', { name: 'Fechar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('toggles a checklist item from inside the detail popup', async () => {
    const user = userEvent.setup();
    render(<NotesPage />);
    await waitFor(() =>
      expect(screen.getByText('Coisas para levar para a praia')).toBeInTheDocument(),
    );

    await user.click(screen.getByText('Coisas para levar para a praia'));
    const dialog = await screen.findByRole('dialog', { name: 'Coisas para levar para a praia' });
    const checkbox = within(dialog).getByRole('checkbox', {
      name: 'Marcar Cadeira como concluído',
    });
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    await waitFor(() =>
      expect(
        within(dialog).getByRole('checkbox', { name: 'Marcar Cadeira como concluído' }),
      ).toBeChecked(),
    );
  });

  it('no longer shows archive/delete buttons on the card', async () => {
    render(<NotesPage />);
    await waitFor(() => expect(screen.getByText('Recomendação do João')).toBeInTheDocument());

    expect(screen.queryByRole('button', { name: 'Arquivar nota' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Excluir nota' })).not.toBeInTheDocument();
  });

  it('shows archived notes only in the Arquivadas view and unarchives from the popup', async () => {
    const user = userEvent.setup();
    await noteService.archiveNote('note-recomendacao-joao');
    render(<NotesPage />);
    await waitFor(() =>
      expect(screen.getByText('Coisas para levar para a praia')).toBeInTheDocument(),
    );
    expect(screen.queryByText('Recomendação do João')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Arquivadas' }));
    expect(screen.getByText('Recomendação do João')).toBeInTheDocument();
    expect(screen.queryByText('Coisas para levar para a praia')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /fixar nota/i })).not.toBeInTheDocument();

    await user.click(screen.getByText('Recomendação do João'));
    const dialog = await screen.findByRole('dialog', { name: 'Recomendação do João' });
    expect(within(dialog).queryByRole('link', { name: 'Editar' })).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Desarquivar' }));

    await waitFor(() => expect(screen.getByText('Nota desarquivada.')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Nenhuma nota arquivada.')).toBeInTheDocument());
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Ativas' }));
    expect(screen.getByText('Recomendação do João')).toBeInTheDocument();
  });

  it('shows a pt-BR error when pinning a note fails', async () => {
    const user = userEvent.setup();
    const pinSpy = vi.spyOn(noteService, 'togglePin').mockRejectedValueOnce(apiValidationError());
    render(<NotesPage />);
    await waitFor(() =>
      expect(screen.getByText('Coisas para levar para a praia')).toBeInTheDocument(),
    );

    const card = screen
      .getByText('Coisas para levar para a praia')
      .closest('.MuiPaper-root') as HTMLElement;
    await user.click(within(card).getByRole('button', { name: 'Desafixar nota' }));

    expect(await screen.findByText(VALIDATION_ERROR_MESSAGE)).toBeInTheDocument();
    pinSpy.mockRestore();
  });
});
