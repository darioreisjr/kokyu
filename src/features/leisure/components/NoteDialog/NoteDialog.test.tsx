import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { NoteDialog } from './NoteDialog';

describe('NoteDialog', () => {
  it('saves a text note', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<NoteDialog open onClose={vi.fn()} onSave={onSave} />);

    await user.type(screen.getByLabelText('Conteúdo'), 'Prestar atenção na fotografia.');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'text', content: 'Prestar atenção na fotografia.' }),
    );
  });

  it('disables saving an empty note', () => {
    render(<NoteDialog open onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });

  it('switches to checklist and adds/checks/removes items', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<NoteDialog open onClose={vi.fn()} onSave={onSave} />);

    await user.click(screen.getByLabelText('Tipo'));
    await user.click(screen.getByRole('option', { name: 'Checklist' }));
    await user.click(screen.getByRole('button', { name: 'Adicionar item' }));
    await user.type(screen.getByLabelText('Item 1'), 'Protetor solar');

    await user.click(screen.getByRole('button', { name: 'Adicionar item' }));
    expect(screen.getAllByRole('button', { name: 'Remover item' })).toHaveLength(2);

    await user.click(screen.getAllByRole('button', { name: 'Remover item' })[1]!);
    expect(screen.getAllByRole('button', { name: 'Remover item' })).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'checklist',
        checklistItems: [expect.objectContaining({ text: 'Protetor solar', checked: false })],
      }),
    );
  });

  it('shows the link field only for link-type notes', async () => {
    const user = userEvent.setup();
    render(<NoteDialog open onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.queryByLabelText('Link')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Tipo'));
    await user.click(screen.getByRole('option', { name: 'Link' }));
    expect(screen.getByLabelText('Link')).toBeInTheDocument();
  });

  it('closes via Cancelar', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<NoteDialog open onClose={onClose} onSave={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalled();
  });
});
