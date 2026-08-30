import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../test/test-utils';
import { KokyuButton } from './KokyuButton';

describe('KokyuButton', () => {
  it('renders its children as an accessible name', () => {
    render(<KokyuButton>Entrar</KokyuButton>);
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('calls onClick when activated', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<KokyuButton onClick={onClick}>Entrar</KokyuButton>);

    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is unavailable when disabled', () => {
    const onClick = vi.fn();
    render(
      <KokyuButton onClick={onClick} disabled>
        Entrar
      </KokyuButton>,
    );

    // A truly disabled button can't be clicked by a real user or by
    // userEvent (it enforces `pointer-events`), so disabledness itself
    // is the behavior under test here.
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled();
  });

  it('shows a loading indicator and disables itself while loading', () => {
    render(<KokyuButton loading>Entrar</KokyuButton>);

    const button = screen.getByRole('button', { name: 'Carregando' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('is unavailable while loading, preventing duplicate submits', () => {
    const onClick = vi.fn();
    render(
      <KokyuButton onClick={onClick} loading>
        Entrar
      </KokyuButton>,
    );

    expect(screen.getByRole('button', { name: 'Carregando' })).toBeDisabled();
  });
});
