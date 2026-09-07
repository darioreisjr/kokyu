'use client';

import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { darkColorTokens } from '../../tokens/semantic/colors';
import type { AppShellUser } from '../KokyuAppShell/AppShellUser';
import { KokyuAvatar } from '../KokyuAvatar/KokyuAvatar';
import { KokyuLogo } from '../KokyuLogo/KokyuLogo';
import { isNavigationItemActive } from '../NavigationItem/isNavigationItemActive';
import { NavigationItem, type NavigationItemConfig } from '../NavigationItem/NavigationItem';

export interface NavigationDrawerProps {
  items: NavigationItemConfig[];
  bottomItems: NavigationItemConfig[];
  pathname: string;
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  logoutLabel?: string;
  /** Omitted renders no identity row — e.g. Storybook/tests with no session to show. */
  user?: AppShellUser;
}

/**
 * Mobile navigation surface, opened from `MobileTopBar`'s menu button.
 * `Drawer` (built on MUI's `Modal`) already provides focus trapping,
 * `Escape`-to-close and click-outside-to-close — no need to hand-roll
 * any of that here, only to wire `open`/`onClose` correctly.
 */
export function NavigationDrawer({
  items,
  bottomItems,
  pathname,
  open,
  onClose,
  onLogout,
  logoutLabel = 'Sair',
  user,
}: NavigationDrawerProps) {
  function handleLogout() {
    onClose();
    onLogout();
  }

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: 280,
            maxWidth: '85vw',
            backgroundColor: darkColorTokens.background.default,
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          },
        },
      }}
    >
      <Stack sx={{ height: '100%' }}>
        <Stack sx={{ padding: 3, flexShrink: 0 }} spacing={2}>
          <KokyuLogo size="md" />
          {user ? (
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
              <KokyuAvatar src={user.avatarUrl} alt={user.name} initials={user.initials} size="xs" />
              <Typography
                variant="labelLarge"
                noWrap
                sx={{ color: darkColorTokens.text.primary, minWidth: 0 }}
              >
                {user.name}
              </Typography>
            </Stack>
          ) : null}
        </Stack>
        {user ? <Divider sx={{ borderColor: darkColorTokens.border.subtle }} /> : null}

        <nav aria-label="Navegação principal" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <List component="div" sx={{ paddingInline: 1.5 }}>
            {items.map((item) => (
              <NavigationItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={isNavigationItemActive(pathname, item.href)}
                onClick={onClose}
              />
            ))}
          </List>
        </nav>

        <div style={{ flexShrink: 0 }}>
          <Divider sx={{ borderColor: darkColorTokens.border.subtle }} />
          <List component="div" sx={{ paddingInline: 1.5, paddingBlock: 1 }}>
            {bottomItems.map((item) => (
              <NavigationItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={isNavigationItemActive(pathname, item.href)}
                onClick={onClose}
              />
            ))}
            <NavigationItem icon={LogoutRoundedIcon} label={logoutLabel} onClick={handleLogout} />
          </List>
        </div>
      </Stack>
    </Drawer>
  );
}
