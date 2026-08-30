import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen, waitFor, within } from '../../../../../test/test-utils';
import { resetLeisureDb } from '../../services/leisureMockDb';
import { NotesPage } from './NotesPage';

describe('NotesPage', () => {
  beforeEach(() => {
    resetLeisureDb();
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

  it('creates a new note', async () => {
    const user = userEvent.setup();
    render(<NotesPage />);
    await waitFor(() =>
      expect(screen.getByText('Coisas para levar para a praia')).toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: 'Nova nota' }));
    const dialog = await screen.findByRole('dialog', { name: 'Nova nota' });
    await user.type(within(dialog).getByLabelText('Conteúdo'), 'Comprar cordas novas.');
    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(screen.getByText('Nota salva.')).toBeInTheDocument());
    expect(screen.getByText('Comprar cordas novas.')).toBeInTheDocument();
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

  it('edits an existing note', async () => {
    const user = userEvent.setup();
    render(<NotesPage />);
    await waitFor(() => expect(screen.getByText('Recomendação do João')).toBeInTheDocument());

    await user.click(screen.getByText('Recomendação do João'));
    const dialog = await screen.findByRole('dialog', { name: 'Editar nota' });
    expect(within(dialog).getByLabelText('Título (opcional)')).toHaveValue('Recomendação do João');
    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(screen.getByText('Nota atualizada.')).toBeInTheDocument());
  });

  it('archives a note, removing it from the visible list', async () => {
    const user = userEvent.setup();
    render(<NotesPage />);
    await waitFor(() => expect(screen.getByText('Recomendação do João')).toBeInTheDocument());

    const card = screen.getByText('Recomendação do João').closest('.MuiPaper-root') as HTMLElement;
    await user.click(within(card).getByRole('button', { name: 'Arquivar nota' }));

    await waitFor(() => expect(screen.getByText('Nota arquivada.')).toBeInTheDocument());
    expect(screen.queryByText('Recomendação do João')).not.toBeInTheDocument();
  });

  it('deletes a note after confirming', async () => {
    const user = userEvent.setup();
    render(<NotesPage />);
    await waitFor(() => expect(screen.getByText('Recomendação do João')).toBeInTheDocument());

    const card = screen.getByText('Recomendação do João').closest('.MuiPaper-root') as HTMLElement;
    await user.click(within(card).getByRole('button', { name: 'Excluir nota' }));

    const confirmDialog = await screen.findByRole('dialog', { name: 'Excluir nota?' });
    await user.click(within(confirmDialog).getByRole('button', { name: 'Excluir' }));

    await waitFor(() => expect(screen.getByText('Nota excluída.')).toBeInTheDocument());
  });
});
