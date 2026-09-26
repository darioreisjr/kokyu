import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor, within } from '../../../../../test/test-utils';
import { leisureRoutes } from '../../constants/leisureRoutes';
import { noteService } from '../../services/noteService';
import { resetLeisureDb } from '../../services/leisureMockDb';
import type { Note } from '../../types/note.types';
import { NoteFormPage } from './NoteFormPage';

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

function buildNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'note-recomendacao-joao',
    title: 'Recomendação do João',
    content: 'Assistir Dark.',
    type: 'text',
    tags: [],
    pinned: false,
    archived: false,
    createdAt: '2030-01-01T00:00:00.000Z',
    updatedAt: '2030-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('NoteFormPage', () => {
  beforeEach(() => {
    resetLeisureDb();
    mockPush.mockClear();
  });

  it('shows "Nova nota" as a page heading in create mode, with Salvar disabled while empty', () => {
    render(<NoteFormPage mode="create" />);

    expect(screen.getByRole('heading', { name: 'Nova nota', level: 1 })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });

  it('creates a note and goes back to the Notas list', async () => {
    const user = userEvent.setup();
    const createSpy = vi.spyOn(noteService, 'createNote');
    render(<NoteFormPage mode="create" />);

    await user.type(screen.getByLabelText('Conteúdo'), 'Comprar cordas novas.');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(leisureRoutes.notes));
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'text', content: 'Comprar cordas novas.' }),
    );
    expect(screen.getByText('Nota salva.')).toBeInTheDocument();
    createSpy.mockRestore();
  });

  it('prefills the form in edit mode and updates the note', async () => {
    const user = userEvent.setup();
    const updateSpy = vi.spyOn(noteService, 'updateNote');
    render(<NoteFormPage mode="edit" initialNote={buildNote()} />);

    expect(screen.getByRole('heading', { name: 'Editar nota', level: 1 })).toBeInTheDocument();
    const title = screen.getByLabelText('Título (opcional)');
    expect(title).toHaveValue('Recomendação do João');

    await user.clear(title);
    await user.type(title, 'Série do João');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(leisureRoutes.notes));
    expect(updateSpy).toHaveBeenCalledWith(
      'note-recomendacao-joao',
      expect.objectContaining({ title: 'Série do João' }),
    );
    expect(screen.getByText('Nota atualizada.')).toBeInTheDocument();
    updateSpy.mockRestore();
  });

  it('goes back to the Notas list on Cancelar without saving', async () => {
    const user = userEvent.setup();
    const createSpy = vi.spyOn(noteService, 'createNote');
    render(<NoteFormPage mode="create" />);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(mockPush).toHaveBeenCalledWith(leisureRoutes.notes);
    expect(createSpy).not.toHaveBeenCalled();
    createSpy.mockRestore();
  });

  it('stays on the page and shows an error when saving fails', async () => {
    const user = userEvent.setup();
    const createSpy = vi.spyOn(noteService, 'createNote').mockRejectedValueOnce(new Error('boom'));
    render(<NoteFormPage mode="create" />);

    await user.type(screen.getByLabelText('Conteúdo'), 'Algo.');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(screen.getByText('Não foi possível salvar a nota agora.')).toBeInTheDocument(),
    );
    expect(mockPush).not.toHaveBeenCalled();
    createSpy.mockRestore();
  });

  it('has no Arquivar/Excluir in create mode', () => {
    render(<NoteFormPage mode="create" />);
    expect(screen.queryByRole('button', { name: 'Arquivar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Excluir' })).not.toBeInTheDocument();
  });

  it('archives the note after confirming and goes back to the Notas list', async () => {
    const user = userEvent.setup();
    const archiveSpy = vi.spyOn(noteService, 'archiveNote');
    render(<NoteFormPage mode="edit" initialNote={buildNote()} />);

    await user.click(screen.getByRole('button', { name: 'Arquivar' }));
    const confirm = await screen.findByRole('dialog', { name: 'Arquivar nota?' });
    expect(archiveSpy).not.toHaveBeenCalled();
    await user.click(within(confirm).getByRole('button', { name: 'Arquivar' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(leisureRoutes.notes));
    expect(archiveSpy).toHaveBeenCalledWith('note-recomendacao-joao');
    archiveSpy.mockRestore();
  });

  it('deletes the note after confirming and goes back to the Notas list', async () => {
    const user = userEvent.setup();
    const deleteSpy = vi.spyOn(noteService, 'deleteNote');
    render(<NoteFormPage mode="edit" initialNote={buildNote()} />);

    await user.click(screen.getByRole('button', { name: 'Excluir' }));
    const confirm = await screen.findByRole('dialog', { name: 'Excluir nota?' });
    await user.click(within(confirm).getByRole('button', { name: 'Excluir' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(leisureRoutes.notes));
    expect(deleteSpy).toHaveBeenCalledWith('note-recomendacao-joao');
    expect(screen.getByText('Nota excluída.')).toBeInTheDocument();
    deleteSpy.mockRestore();
  });

  it('does nothing when the confirmation is cancelled', async () => {
    const user = userEvent.setup();
    const deleteSpy = vi.spyOn(noteService, 'deleteNote');
    render(<NoteFormPage mode="edit" initialNote={buildNote()} />);

    await user.click(screen.getByRole('button', { name: 'Excluir' }));
    const confirm = await screen.findByRole('dialog', { name: 'Excluir nota?' });
    await user.click(within(confirm).getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(deleteSpy).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
    deleteSpy.mockRestore();
  });

  it('saves a tag typed without Enter, lower-cased (regression: tags were silently dropped)', async () => {
    const user = userEvent.setup();
    const createSpy = vi.spyOn(noteService, 'createNote');
    render(<NoteFormPage mode="create" />);

    await user.type(screen.getByLabelText('Conteúdo'), 'Comprar cordas novas.');
    await user.type(screen.getByLabelText('Tags (opcional)'), 'Música, Violão');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(createSpy).toHaveBeenCalled());
    expect(createSpy.mock.calls[0]![0].tags).toEqual(['música', 'violão']);
    createSpy.mockRestore();
  });

  it('shows the saved tags as chips in edit mode and saves removals', async () => {
    const user = userEvent.setup();
    const updateSpy = vi.spyOn(noteService, 'updateNote');
    render(<NoteFormPage mode="edit" initialNote={buildNote({ tags: ['série', 'dica'] })} />);

    const chip = screen.getByRole('button', { name: 'série' });
    expect(screen.getByRole('button', { name: 'dica' })).toBeInTheDocument();
    await user.click(chip.querySelector('svg') as SVGElement);
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(updateSpy).toHaveBeenCalled());
    expect(updateSpy.mock.calls[0]![1].tags).toEqual(['dica']);
    updateSpy.mockRestore();
  });
});
