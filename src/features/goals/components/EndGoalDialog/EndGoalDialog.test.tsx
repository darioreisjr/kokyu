import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { EndGoalDialog } from './EndGoalDialog';

describe('EndGoalDialog', () => {
  it('defaults to "Abandonada" and confirms with it', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<EndGoalDialog open onClose={vi.fn()} onConfirm={onConfirm} />);

    await user.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(onConfirm).toHaveBeenCalledWith('abandoned', undefined);
  });

  it('lets the user pick "Concluída" and pass a note', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<EndGoalDialog open onClose={vi.fn()} onConfirm={onConfirm} />);

    await user.click(screen.getByRole('radio', { name: 'Concluída' }));
    await user.type(screen.getByLabelText('Nota (opcional)'), 'Motivo qualquer');
    await user.click(screen.getByRole('button', { name: 'Confirmar' }));

    expect(onConfirm).toHaveBeenCalledWith('completed', 'Motivo qualquer');
  });

  it('calls onClose from "Cancelar"', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<EndGoalDialog open onClose={onClose} onConfirm={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalled();
  });
});
