import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { GoalCheckInDialog } from './GoalCheckInDialog';

describe('GoalCheckInDialog', () => {
  it('submits with just the perceived status — nothing else is required', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<GoalCheckInDialog open goalTitle="Ler 20 livros" onClose={() => {}} onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: 'No ritmo' }));
    await user.click(screen.getByRole('button', { name: 'Salvar check-in' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ perceivedStatus: 'onTrack' }));
  });

  it('reveals reflection fields only after "Adicionar comentário"', async () => {
    const user = userEvent.setup();
    render(<GoalCheckInDialog open onClose={() => {}} onSave={() => {}} />);

    expect(screen.queryByLabelText('Existe algum bloqueio?')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Adicionar comentário' }));
    expect(screen.getByLabelText('Existe algum bloqueio?')).toBeInTheDocument();
  });
});
