import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import type { GoalNote } from '../../types';
import { GoalNotesList } from './GoalNotesList';

const notes: GoalNote[] = [
  {
    id: 'note-1',
    goalId: 'goal-1',
    text: 'Uma ideia qualquer',
    createdAt: '2026-06-20T08:00:00.000Z',
  },
];

describe('GoalNotesList', () => {
  it('shows every existing note', () => {
    render(<GoalNotesList notes={notes} onAdd={vi.fn()} />);
    expect(screen.getByText('Uma ideia qualquer')).toBeInTheDocument();
  });

  it('adds a note and clears the field', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<GoalNotesList notes={[]} onAdd={onAdd} />);

    const field = screen.getByLabelText('Nova nota');
    await user.type(field, 'Comprar cordas novas');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(onAdd).toHaveBeenCalledWith('Comprar cordas novas');
    expect(field).toHaveValue('');
  });

  it('never calls onAdd for a blank note', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<GoalNotesList notes={[]} onAdd={onAdd} />);
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(onAdd).not.toHaveBeenCalled();
  });
});
