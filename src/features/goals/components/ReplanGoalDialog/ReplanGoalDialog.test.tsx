import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { ReplanGoalDialog } from './ReplanGoalDialog';

describe('ReplanGoalDialog', () => {
  it('confirms with undefined when "Sem prazo" is checked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <ReplanGoalDialog
        open
        currentTargetDate="2026-12-31"
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole('checkbox', { name: 'Sem prazo' }));
    await user.click(screen.getByRole('button', { name: 'Replanejar' }));

    expect(onConfirm).toHaveBeenCalledWith(undefined, undefined);
  });

  it('keeps the date field visible by default so the current deadline can be adjusted', () => {
    render(
      <ReplanGoalDialog
        open
        currentTargetDate="2026-12-31"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByRole('group', { name: 'Novo prazo' })).toBeInTheDocument();
  });

  it('calls onClose from "Cancelar"', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ReplanGoalDialog open onClose={onClose} onConfirm={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalled();
  });
});
