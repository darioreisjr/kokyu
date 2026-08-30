import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../test/test-utils';
import type { NavigationItemConfig } from '../NavigationItem/NavigationItem';
import { KokyuAppShell } from './KokyuAppShell';

let mockPathname = '/app';
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

const items: NavigationItemConfig[] = [
  { id: 'respiracao', label: 'Respiração', href: '/app', icon: HomeRoundedIcon },
  { id: 'missoes', label: 'Missões', href: '/app/missoes', icon: AssignmentRoundedIcon },
];
const bottomItems: NavigationItemConfig[] = [
  { id: 'perfil', label: 'Perfil', href: '/app/perfil', icon: PersonRoundedIcon },
];

describe('KokyuAppShell', () => {
  beforeEach(() => {
    mockPathname = '/app';
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('renders its children in the main content area', () => {
    render(
      <KokyuAppShell items={items} bottomItems={bottomItems} onLogout={vi.fn()}>
        <div>Conteúdo da página</div>
      </KokyuAppShell>,
    );

    expect(screen.getByText('Conteúdo da página')).toBeInTheDocument();
  });

  it('renders the navigation items', () => {
    render(
      <KokyuAppShell items={items} bottomItems={bottomItems} onLogout={vi.fn()}>
        <div>Conteúdo</div>
      </KokyuAppShell>,
    );

    expect(screen.getByRole('link', { name: 'Respiração' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Missões' })).toBeInTheDocument();
  });

  it("shows the active item's label in the mobile top bar title", () => {
    mockPathname = '/app/missoes';
    render(
      <KokyuAppShell items={items} bottomItems={bottomItems} onLogout={vi.fn()}>
        <div>Conteúdo</div>
      </KokyuAppShell>,
    );

    expect(screen.getAllByText('Missões').length).toBeGreaterThan(0);
  });

  it('opens the mobile drawer from the top bar menu button', async () => {
    const user = userEvent.setup();
    render(
      <KokyuAppShell items={items} bottomItems={bottomItems} onLogout={vi.fn()}>
        <div>Conteúdo</div>
      </KokyuAppShell>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Abrir menu' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('calls onLogout from the sidebar', async () => {
    const onLogout = vi.fn();
    const user = userEvent.setup();
    render(
      <KokyuAppShell items={items} bottomItems={bottomItems} onLogout={onLogout}>
        <div>Conteúdo</div>
      </KokyuAppShell>,
    );

    await user.click(screen.getByRole('button', { name: 'Sair' }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('toggles collapse and persists the preference to localStorage', async () => {
    const user = userEvent.setup();
    render(
      <KokyuAppShell items={items} bottomItems={bottomItems} onLogout={vi.fn()}>
        <div>Conteúdo</div>
      </KokyuAppShell>,
    );

    await user.click(screen.getByRole('button', { name: 'Recolher menu' }));

    await waitFor(() => {
      expect(window.localStorage.getItem('kokyu:sidebar-collapsed')).toBe('true');
    });
    expect(screen.getByRole('button', { name: 'Expandir menu' })).toBeInTheDocument();
  });

  it('restores a previously persisted collapsed preference', async () => {
    window.localStorage.setItem('kokyu:sidebar-collapsed', 'true');

    render(
      <KokyuAppShell items={items} bottomItems={bottomItems} onLogout={vi.fn()}>
        <div>Conteúdo</div>
      </KokyuAppShell>,
    );

    expect(await screen.findByRole('button', { name: 'Expandir menu' })).toBeInTheDocument();
  });
});
