'use client';

import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

import { KokyuAppShell, type AppShellUser } from '@/design-system/components';
import { useCurrentUser } from '@/features/current-user';
import { usePreferences } from '@/features/settings/providers/PreferencesProvider';
import { preferencesStorage } from '@/features/settings/services/preferencesStorage';

import { bottomNavigationItems, navigationItems } from '../../config/navigationItems';
import { useLogout } from '../../hooks/useLogout';
import { applyNavigationFlags } from '../../utils/applyNavigationFlags';

/**
 * `CurrentUser.profile` → the shell's generic `AppShellUser` — kept
 * here rather than in `features/profile` (whose `getInitials` this
 * deliberately doesn't import) so `features/navigation` never has to
 * cross into another feature just to render a name/avatar; `current-
 * user` is the one cross-cutting identity source every feature is
 * meant to read from directly.
 */
function toAppShellUser(profile: {
  firstName: string;
  lastName: string | null;
  avatarUrl: string | null;
}): AppShellUser {
  const lastName = profile.lastName ?? '';
  const name = `${profile.firstName} ${lastName}`.trim();
  const initials =
    `${profile.firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase();
  return { name, initials, avatarUrl: profile.avatarUrl };
}

/**
 * Wires the Kokyu-specific menu config and the (mocked) logout flow
 * into the generic `KokyuAppShell` — the one Client Component this
 * needs, so `app/app/layout.tsx` itself can stay a Server Component
 * (same split as `AuthTransition` for the `(auth)` layout).
 *
 * Also drives the shell's collapse state from Settings → Navegação
 * instead of letting `KokyuAppShell` manage its own localStorage key —
 * one preferences store, not two competing ones. When "Lembrar estado
 * do menu" is on, toggling updates `sidebarMode` for real (persisted
 * through `PreferencesProvider`); when it's off, toggling only updates
 * local state for this mount, so it reverts to `sidebarMode` on the
 * next load without ever having been written anywhere.
 *
 * Finally, tracks `general.lastVisitedPage` while "Continuar de onde
 * parei" is on — the only writer of that field, and only while the
 * preference that reads it is actually enabled, so it stays empty
 * (and unused by `useLoginForm`) for everyone who hasn't opted in.
 */
export interface AuthenticatedShellProps {
  children: ReactNode;
  /**
   * Server-resolved `GET /feature-flags/navigation` result (see
   * `app/app/layout.tsx`), keyed by navigation item id — decides which
   * sidebar/drawer items render locked ("Em breve"). Fetched
   * server-side so there's no flash of an unlocked item before this
   * mounts.
   */
  navigationFlags: Record<string, boolean>;
}

export function AuthenticatedShell({ children, navigationFlags }: AuthenticatedShellProps) {
  const { logout } = useLogout();
  const { profile } = useCurrentUser();
  const pathname = usePathname();
  const { preferences, updateSection } = usePreferences();
  const { sidebarMode, rememberSidebarState } = preferences.navigation;
  const { resumeLastPage, lastVisitedPage } = preferences.general;

  const theme = useTheme();
  const isTabletRange = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  // A brand new visitor (nothing saved yet) keeps the original
  // tablet-collapses-by-default heuristic; a returning visitor's
  // explicit `sidebarMode` — even if it happens to equal the default —
  // wins instead. `hasStored()` is the only way to tell those apart,
  // since a fresh visitor's `sidebarMode` reads identically to
  // someone who explicitly chose "Expandido".
  const [hasStoredPreferences, setHasStoredPreferences] = useState(false);
  useEffect(() => {
    queueMicrotask(() => setHasStoredPreferences(preferencesStorage.hasStored()));
  }, []);

  const [sessionCollapsed, setSessionCollapsed] = useState<boolean | null>(null);
  const defaultCollapsed = hasStoredPreferences ? sidebarMode === 'collapsed' : isTabletRange;
  const collapsed = sessionCollapsed ?? defaultCollapsed;

  function toggleCollapsed() {
    const next = !collapsed;
    if (rememberSidebarState) {
      // From this action onward, `sidebarMode` is an explicit choice,
      // not just the untouched default — `hasStoredPreferences` needs
      // to flip right away, in the same update, or this toggle would
      // write the new `sidebarMode` but `collapsed` would keep
      // resolving through the (now stale) tablet-viewport fallback
      // instead of it, making the click visually do nothing.
      setHasStoredPreferences(true);
      updateSection('navigation', { sidebarMode: next ? 'collapsed' : 'expanded' });
    } else {
      setSessionCollapsed(next);
    }
  }

  useEffect(() => {
    if (!resumeLastPage || pathname === lastVisitedPage) return;
    updateSection('general', { lastVisitedPage: pathname });
  }, [pathname, resumeLastPage, lastVisitedPage, updateSection]);

  return (
    <KokyuAppShell
      items={applyNavigationFlags(navigationItems, navigationFlags)}
      bottomItems={applyNavigationFlags(bottomNavigationItems, navigationFlags)}
      onLogout={logout}
      collapsed={collapsed}
      onToggleCollapse={toggleCollapsed}
      user={profile ? toAppShellUser(profile) : undefined}
    >
      {children}
    </KokyuAppShell>
  );
}
