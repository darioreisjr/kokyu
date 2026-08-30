import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../test/test-utils';
import type { NavigationItemConfig } from '../NavigationItem/NavigationItem';
import { Sidebar } from './Sidebar';

const items: NavigationItemConfig[] = [
  { id: 'respiracao', label: 'Respiração', href: '/app', icon: HomeRoundedIcon },
  { id: 'missoes', label: 'Missões', href: '/app/missoes', icon: AssignmentRoundedIcon },
];
const bottomItems: NavigationItemConfig[] = [
  { id: 'perfil', label: 'Perfil', href: '/app/perfil', icon: PersonRoundedIcon },
];

describe('Sidebar', () => {
  it('renders every top and bottom item, plus "Sair"', () => {
    render(
      <Sidebar
        items={items}
        bottomItems={bottomItems}
        pathname="/app"
        collapsed={false}
        onToggleCollapse={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    expect(screen.getByRole('link', { name: 'Respiração' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Missões' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Perfil' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument();
  });

  it('marks the item matching pathname as active', () => {
    render(
      <Sidebar
        items={items}
        bottomItems={bottomItems}
        pathname="/app/missoes"
        collapsed={false}
        onToggleCollapse={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    expect(screen.getByRole('link', { name: 'Missões' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Respiração' })).not.toHaveAttribute('aria-current');
  });

  it('calls onLogout when "Sair" is clicked', async () => {
    const onLogout = vi.fn();
    const user = userEvent.setup();
    render(
      <Sidebar
        items={items}
        bottomItems={bottomItems}
        pathname="/app"
        collapsed={false}
        onToggleCollapse={vi.fn()}
        onLogout={onLogout}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Sair' }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('exposes a labeled navigation landmark', () => {
    render(
      <Sidebar
        items={items}
        bottomItems={bottomItems}
        pathname="/app"
        collapsed={false}
        onToggleCollapse={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument();
  });

  it('shows "Recolher menu" when expanded and calls onToggleCollapse when clicked', async () => {
    const onToggleCollapse = vi.fn();
    const user = userEvent.setup();
    render(
      <Sidebar
        items={items}
        bottomItems={bottomItems}
        pathname="/app"
        collapsed={false}
        onToggleCollapse={onToggleCollapse}
        onLogout={vi.fn()}
      />,
    );

    const toggle = screen.getByRole('button', { name: 'Recolher menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.click(toggle);
    expect(onToggleCollapse).toHaveBeenCalledTimes(1);
  });

  it('shows "Expandir menu" and hides labels when collapsed', () => {
    render(
      <Sidebar
        items={items}
        bottomItems={bottomItems}
        pathname="/app"
        collapsed
        onToggleCollapse={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    const toggle = screen.getByRole('button', { name: 'Expandir menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Respiração')).not.toBeInTheDocument();
    // The accessible name survives collapse even though the visible text doesn't.
    expect(screen.getByRole('link', { name: 'Respiração' })).toBeInTheDocument();
  });
});
