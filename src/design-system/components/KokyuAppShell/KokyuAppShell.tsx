'use client';

import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

import { themePalette } from '../../theme/useThemePalette';
import { isNavigationItemActive } from '../NavigationItem/isNavigationItemActive';
import { type NavigationItemConfig } from '../NavigationItem/NavigationItem';
import type { AppShellUser } from './AppShellUser';
import { MobileTopBar } from '../MobileTopBar/MobileTopBar';
import { NavigationDrawer } from '../NavigationDrawer/NavigationDrawer';
import { Sidebar } from '../Sidebar/Sidebar';

export type { AppShellUser } from './AppShellUser';

export interface KokyuAppShellProps {
  items: NavigationItemConfig[];
  bottomItems: NavigationItemConfig[];
  onLogout: () => void;
  children: ReactNode;
  /** Omitted renders no identity chrome — e.g. Storybook/tests with no session to show. */
  user?: AppShellUser;
  /**
   * Externally-controlled collapse state — pass both this and
   * `onToggleCollapse` to hand collapse ownership to the caller (e.g.
   * `AuthenticatedShell`, driving it off `preferences.navigation`).
   * The shell then stops reading/writing its own localStorage key
   * entirely, so state never lives in two places at once. Omit both
   * for the shell's default self-managed behavior (used by Storybook
   * and tests, where there's no preferences source to defer to).
   */
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'kokyu:sidebar-collapsed';

/**
 * Structural shell for every authenticated page: `Sidebar` (desktop and
 * tablet) or `MobileTopBar` + `NavigationDrawer` (mobile), plus the main
 * content area. Owns responsive switching, collapse state and the
 * active item, and nothing about any specific page — `items`/
 * `bottomItems`/`onLogout` are the only inputs, so this stays reusable
 * rather than coupled to Kokyu's particular menu or auth mock.
 *
 * The collapsed/expanded default (tablet starts collapsed, desktop
 * expanded) comes from `useMediaQuery`, which — like the localStorage
 * read below — resolves to a stable default during SSR and the first
 * client render, then updates after mount. Both can cause a brief
 * visual adjustment right after hydration, never a mismatch error.
 */
export function KokyuAppShell({
  items,
  bottomItems,
  onLogout,
  children,
  collapsed: collapsedProp,
  onToggleCollapse,
  user,
}: KokyuAppShellProps) {
  const pathname = usePathname();
  const theme = useTheme();
  const isTabletRange = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const isControlled = collapsedProp !== undefined;

  const [collapsedOverride, setCollapsedOverride] = useState<boolean | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isControlled) return;
    // Deferred to a microtask rather than read synchronously here: the
    // React Compiler flags a synchronous `setState` at the top of an
    // effect body (`react-hooks/set-state-in-effect`) — same fix as
    // `useUsernameAvailability`'s debounced callback. Doesn't change
    // the timing in any way that matters: this still resolves before
    // the browser's next paint.
    queueMicrotask(() => {
      const stored = window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
      if (stored !== null) setCollapsedOverride(stored === 'true');
    });
  }, [isControlled]);

  const uncontrolledCollapsed = collapsedOverride ?? isTabletRange;
  const collapsed = isControlled ? collapsedProp : uncontrolledCollapsed;

  function toggleCollapsed() {
    if (isControlled) {
      onToggleCollapse?.();
      return;
    }
    const next = !uncontrolledCollapsed;
    setCollapsedOverride(next);
    window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(next));
  }

  const activeItem = [...items, ...bottomItems].find((item) =>
    isNavigationItemActive(pathname, item.href),
  );

  return (
    // `column` on mobile (TopBar stacks above the content), `row` from
    // `sm` up (Sidebar sits beside it) — without this, the mobile
    // TopBar ends up as a narrow flex item next to `main` instead of a
    // full-width bar above it. The switch happens at `sm` (600px)
    // rather than `md` so the project's "tablet" viewport (820px) gets
    // the compact sidebar the spec asks for, not the mobile drawer.
    //
    // `height` (not `minHeight`) is deliberate: it caps this shell at
    // exactly the viewport, so a tall page can never grow it past that
    // and hand scrolling to `body`. With that cap in place, `main`'s own
    // `overflowY: 'auto'` below becomes the only thing that scrolls —
    // Sidebar/MobileTopBar never move, without even needing `position:
    // sticky` to do it (Sidebar keeps it anyway, defensively).
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, height: '100dvh' }}>
      <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
        <Sidebar
          items={items}
          bottomItems={bottomItems}
          pathname={pathname}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
          onLogout={onLogout}
          user={user}
        />
      </Box>

      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        <MobileTopBar
          title={activeItem?.label}
          onMenuClick={() => setMobileOpen(true)}
          user={user}
        />
      </Box>
      <NavigationDrawer
        items={items}
        bottomItems={bottomItems}
        pathname={pathname}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onLogout={onLogout}
        user={user}
      />

      <Box
        component="main"
        sx={(themeArg) => ({
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          overflowY: 'auto',
          padding: { xs: 3, sm: 4, md: 6 },
          paddingBottom: { xs: 'calc(env(safe-area-inset-bottom) + 24px)', md: 6 },
          backgroundColor: themePalette(themeArg).kokyu.background.default,
        })}
      >
        {children}
      </Box>
    </Box>
  );
}
