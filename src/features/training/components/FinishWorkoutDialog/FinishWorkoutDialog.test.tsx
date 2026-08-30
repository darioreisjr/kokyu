import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '../../../../../test/test-utils';
import { FinishWorkoutDialog } from './FinishWorkoutDialog';

describe('FinishWorkoutDialog', () => {
  it('lets the user skip the optional effort rating entirely', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<FinishWorkoutDialog open onClose={vi.fn()} onConfirm={onConfirm} />);
    expect(screen.getByRole('heading', { name: 'Como foi o treino?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Pular' }));
    expect(onConfirm).toHaveBeenCalledWith(undefined);
  });

  it('confirms with the selected perceived effort', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<FinishWorkoutDialog open onClose={vi.fn()} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole('radio', { name: '5 Stars' }));
    await user.click(screen.getByRole('button', { name: 'Finalizar treino' }));
    expect(onConfirm).toHaveBeenCalledWith(5);
  });

  it('disables both actions while submitting', () => {
    render(<FinishWorkoutDialog open onClose={vi.fn()} onConfirm={vi.fn()} isSubmitting />);
    expect(screen.getByRole('button', { name: 'Pular' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Carregando' })).toBeDisabled();
  });
});
