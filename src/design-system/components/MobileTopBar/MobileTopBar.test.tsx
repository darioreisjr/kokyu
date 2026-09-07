import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../test/test-utils';
import { MobileTopBar } from './MobileTopBar';

describe('MobileTopBar', () => {
  it('renders an accessible "open menu" button', () => {
    render(<MobileTopBar onMenuClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Abrir menu' })).toBeInTheDocument();
  });

  it('calls onMenuClick when the menu button is clicked', async () => {
    const onMenuClick = vi.fn();
    const user = userEvent.setup();
    render(<MobileTopBar onMenuClick={onMenuClick} />);

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }));
    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });

  it('shows the current page title when given', () => {
    render(<MobileTopBar title="Treinamento" onMenuClick={vi.fn()} />);
    expect(screen.getByText('Treinamento')).toBeInTheDocument();
  });

  it('renders without a title', () => {
    render(<MobileTopBar onMenuClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Abrir menu' })).toBeInTheDocument();
  });

  it('shows the user avatar when a user is given, and omits it otherwise', () => {
    const { rerender } = render(<MobileTopBar onMenuClick={vi.fn()} />);
    expect(screen.queryByAltText('Dario Reis')).not.toBeInTheDocument();

    rerender(
      <MobileTopBar
        onMenuClick={vi.fn()}
        user={{ name: 'Dario Reis', initials: 'DR', avatarUrl: null }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Menu do usuário — Dario Reis' })).toBeInTheDocument();
  });

  it('opens the drawer when the user avatar is clicked', async () => {
    const onMenuClick = vi.fn();
    const user = userEvent.setup();
    render(
      <MobileTopBar
        onMenuClick={onMenuClick}
        user={{ name: 'Dario Reis', initials: 'DR', avatarUrl: null }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Menu do usuário — Dario Reis' }));
    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });
});
