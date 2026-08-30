import userEvent from '@testing-library/user-event';
import { fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { LogEntryDialog } from './LogEntryDialog';

describe('LogEntryDialog', () => {
  it('shows the item being logged', () => {
    render(<LogEntryDialog open itemTitle="Interestelar" onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.getByText('Interestelar')).toBeInTheDocument();
  });

  it('saves with a rating and notes', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<LogEntryDialog open itemTitle="Interestelar" onClose={vi.fn()} onSave={onSave} />);
    // The dialog's own "reset on open" effect runs via a queued microtask;
    // waiting for the (already-rendered) item title first guarantees it has
    // settled before the rating click below, so it can't stomp that click.
    await waitFor(() => expect(screen.getByText('Interestelar')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('radio', { name: '5 de 5 estrelas' }));
    await user.type(screen.getByLabelText('O que você achou? (opcional)'), 'Roteiro impecável.');
    await user.click(screen.getByRole('button', { name: 'Registrar' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ rating: 5, notes: 'Roteiro impecável.' }),
    );
  });

  it('saves with no rating at all (optional)', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<LogEntryDialog open itemTitle="Interestelar" onClose={vi.fn()} onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: 'Registrar' }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ rating: null }));
  });

  it('closes via Cancelar', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<LogEntryDialog open itemTitle="Interestelar" onClose={onClose} onSave={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalled();
  });
});
