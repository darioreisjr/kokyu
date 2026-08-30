import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import type { GoalMilestone } from '../../types';
import { GoalMilestonesList } from './GoalMilestonesList';

const milestones: GoalMilestone[] = [
  { id: 'm1', title: 'Definir o MVP', completed: true, order: 0 },
  { id: 'm2', title: 'Publicar', completed: false, order: 1, targetDate: '2026-12-01' },
];

describe('GoalMilestonesList', () => {
  it('shows every milestone with its completion state', () => {
    render(
      <GoalMilestonesList
        milestones={milestones}
        onToggle={vi.fn()}
        onAdd={vi.fn()}
        onReorder={vi.fn()}
      />,
    );
    expect(screen.getByRole('checkbox', { name: /Definir o MVP/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Publicar/ })).not.toBeChecked();
  });

  it('calls onToggle when a milestone checkbox is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <GoalMilestonesList
        milestones={milestones}
        onToggle={onToggle}
        onAdd={vi.fn()}
        onReorder={vi.fn()}
      />,
    );
    await user.click(screen.getByRole('checkbox', { name: /Publicar/ }));
    expect(onToggle).toHaveBeenCalledWith('m2', true);
  });

  it('adds a new milestone from the input', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(
      <GoalMilestonesList
        milestones={milestones}
        onToggle={vi.fn()}
        onAdd={onAdd}
        onReorder={vi.fn()}
      />,
    );
    await user.type(screen.getByLabelText('Novo marco'), 'Divulgar o app');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(onAdd).toHaveBeenCalledWith('Divulgar o app');
  });

  it('moves a milestone down via onReorder', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    render(
      <GoalMilestonesList
        milestones={milestones}
        onToggle={vi.fn()}
        onAdd={vi.fn()}
        onReorder={onReorder}
      />,
    );
    await user.click(screen.getByRole('button', { name: /Mover "Definir o MVP" para baixo/ }));
    expect(onReorder).toHaveBeenCalledWith(['m2', 'm1']);
  });
});
