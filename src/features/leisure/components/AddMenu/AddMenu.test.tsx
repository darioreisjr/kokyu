import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { AddMenu } from './AddMenu';

describe('AddMenu', () => {
  it('opens a menu with every add option', async () => {
    const user = userEvent.setup();
    render(<AddMenu onSelect={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(screen.getByRole('menuitem', { name: 'Item para depois' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Filme/Série' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Nota' })).toBeInTheDocument();
  });

  it('selects quick capture', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<AddMenu onSelect={onSelect} />);

    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    await user.click(screen.getByRole('menuitem', { name: 'Item para depois' }));

    expect(onSelect).toHaveBeenCalledWith({ kind: 'quick-capture' });
  });

  it('selects an item type shortcut', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<AddMenu onSelect={onSelect} />);

    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    await user.click(screen.getByRole('menuitem', { name: 'Lugar' }));

    expect(onSelect).toHaveBeenCalledWith({ kind: 'item', type: 'place' });
  });

  it('selects note', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<AddMenu onSelect={onSelect} />);

    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    await user.click(screen.getByRole('menuitem', { name: 'Nota' }));

    expect(onSelect).toHaveBeenCalledWith({ kind: 'note' });
  });
});
