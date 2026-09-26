import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { leisureRoutes } from '../../constants/leisureRoutes';
import type { Note } from '../../types/note.types';
import { NoteDetailDialog } from './NoteDetailDialog';

function buildNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'note-1',
    title: 'Ideias de passeio',
    content: 'Ir ao parque no domingo.',
    type: 'idea',
    tags: ['fim-de-semana'],
    pinned: true,
    archived: false,
    createdAt: '2030-01-02T13:30:00.000Z',
    updatedAt: '2030-01-03T13:30:00.000Z',
    ...overrides,
  };
}

describe('NoteDetailDialog', () => {
  it('stays closed without a note', () => {
    render(<NoteDetailDialog note={null} onClose={vi.fn()} onToggleChecklistItem={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the note content, tags, related item, pinned status and dates', () => {
    render(
      <NoteDetailDialog
        note={buildNote()}
        relatedItemTitle="Interestelar"
        onClose={vi.fn()}
        onToggleChecklistItem={vi.fn()}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Ideias de passeio' })).toBeInTheDocument();
    expect(screen.getByText('Ideia')).toBeInTheDocument();
    expect(screen.getByText('Interestelar')).toBeInTheDocument();
    expect(screen.getByText('Ir ao parque no domingo.')).toBeInTheDocument();
    expect(screen.getByText('fim-de-semana')).toBeInTheDocument();
    expect(screen.getByText('Sim')).toBeInTheDocument();
    expect(screen.getByText(/2 de janeiro de 2030/)).toBeInTheDocument();
    expect(screen.getByText(/3 de janeiro de 2030/)).toBeInTheDocument();
  });

  it('falls back to the type label as the title for an untitled note', () => {
    render(
      <NoteDetailDialog
        note={buildNote({ title: undefined, type: 'text', pinned: false })}
        onClose={vi.fn()}
        onToggleChecklistItem={vi.fn()}
      />,
    );
    expect(screen.getByRole('dialog', { name: 'Texto' })).toBeInTheDocument();
    expect(screen.getByText('Não')).toBeInTheDocument();
  });

  it('links Editar to the edit page and calls onClose from Fechar', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <NoteDetailDialog note={buildNote()} onClose={onClose} onToggleChecklistItem={vi.fn()} />,
    );

    expect(screen.getByRole('link', { name: 'Editar' })).toHaveAttribute(
      'href',
      leisureRoutes.noteEdit('note-1'),
    );
    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows the link for a link note', () => {
    render(
      <NoteDetailDialog
        note={buildNote({ type: 'link', linkUrl: 'https://example.com/artigo', content: '' })}
        onClose={vi.fn()}
        onToggleChecklistItem={vi.fn()}
      />,
    );
    expect(screen.getByRole('link', { name: 'https://example.com/artigo' })).toHaveAttribute(
      'href',
      'https://example.com/artigo',
    );
  });

  it('lets checklist items be toggled', async () => {
    const user = userEvent.setup();
    const onToggleChecklistItem = vi.fn();
    render(
      <NoteDetailDialog
        note={buildNote({
          type: 'checklist',
          content: '',
          checklistItems: [{ id: 'check-1', text: 'Protetor solar', checked: false }],
        })}
        onClose={vi.fn()}
        onToggleChecklistItem={onToggleChecklistItem}
      />,
    );

    await user.click(
      screen.getByRole('checkbox', { name: 'Marcar Protetor solar como concluído' }),
    );
    expect(onToggleChecklistItem).toHaveBeenCalledWith('check-1');
  });

  it('offers Desarquivar instead of Editar for an archived note', async () => {
    const user = userEvent.setup();
    const onUnarchive = vi.fn();
    const note = buildNote({ archived: true });
    render(
      <NoteDetailDialog
        note={note}
        onClose={vi.fn()}
        onToggleChecklistItem={vi.fn()}
        onUnarchive={onUnarchive}
      />,
    );

    expect(screen.queryByRole('link', { name: 'Editar' })).not.toBeInTheDocument();
    expect(screen.getByText('Arquivada')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Desarquivar' }));
    expect(onUnarchive).toHaveBeenCalledWith(note);
  });
});
