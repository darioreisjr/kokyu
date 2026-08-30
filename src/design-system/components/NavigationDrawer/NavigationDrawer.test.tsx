import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../test/test-utils';
import type { NavigationItemConfig } from '../NavigationItem/NavigationItem';
import { NavigationDrawer } from './NavigationDrawer';

const items: NavigationItemConfig[] = [
  { id: 'respiracao', label: 'Respiração', href: '/app', icon: HomeRoundedIcon },
  { id: 'missoes', label: 'Missões', href: '/app/missoes', icon: AssignmentRoundedIcon },
];
const bottomItems: NavigationItemConfig[] = [
  { id: 'perfil', label: 'Perfil', href: '/app/perfil', icon: PersonRoundedIcon },
];

describe('NavigationDrawer', () => {
  it('renders nothing reachable when closed', () => {
    render(
      <NavigationDrawer
        items={items}
        bottomItems={bottomItems}
        pathname="/app"
        open={false}
        onClose={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    expect(screen.queryByRole('link', { name: 'Respiração' })).not.toBeInTheDocument();
  });

  it('shows every item, the active one, and "Sair" when open', () => {
    render(
      <NavigationDrawer
        items={items}
        bottomItems={bottomItems}
        pathname="/app/missoes"
        open
        onClose={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    expect(screen.getByRole('link', { name: 'Respiração' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Missões' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Perfil' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument();
  });

  it('closes when a navigation item is selected', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <NavigationDrawer
        items={items}
        bottomItems={bottomItems}
        pathname="/app"
        open
        onClose={onClose}
        onLogout={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('link', { name: 'Missões' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes and logs out when "Sair" is selected', async () => {
    const onClose = vi.fn();
    const onLogout = vi.fn();
    const user = userEvent.setup();
    render(
      <NavigationDrawer
        items={items}
        bottomItems={bottomItems}
        pathname="/app"
        open
        onClose={onClose}
        onLogout={onLogout}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Sair' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <NavigationDrawer
        items={items}
        bottomItems={bottomItems}
        pathname="/app"
        open
        onClose={onClose}
        onLogout={vi.fn()}
      />,
    );

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});
