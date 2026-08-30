import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { RestTimerBar } from './RestTimerBar';

describe('RestTimerBar', () => {
  it('renders no visible content when there is no rest in progress', () => {
    render(<RestTimerBar restEndAt={undefined} onAddSeconds={vi.fn()} onSkip={vi.fn()} />);
    expect(screen.queryByText('Descanso')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('shows the remaining time and lets the user adjust or skip the rest', async () => {
    const user = userEvent.setup();
    const onAddSeconds = vi.fn();
    const onSkip = vi.fn();
    render(
      <RestTimerBar
        restEndAt={new Date(Date.now() + 90_000).toISOString()}
        onAddSeconds={onAddSeconds}
        onSkip={onSkip}
      />,
    );

    expect(screen.getByText('Descanso')).toBeInTheDocument();
    const clock = screen.getByText('01:30');
    expect(clock).toHaveAttribute('aria-label', 'Descanso: 01:30 restantes');

    await user.click(screen.getByRole('button', { name: '+15s' }));
    expect(onAddSeconds).toHaveBeenCalledWith(15);

    await user.click(screen.getByRole('button', { name: '-15s' }));
    expect(onAddSeconds).toHaveBeenCalledWith(-15);

    await user.click(screen.getByRole('button', { name: 'Pular descanso' }));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('treats a rest end already in the past as not resting', () => {
    render(
      <RestTimerBar
        restEndAt={new Date(Date.now() - 1000).toISOString()}
        onAddSeconds={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(screen.queryByText('Descanso')).not.toBeInTheDocument();
  });
});
