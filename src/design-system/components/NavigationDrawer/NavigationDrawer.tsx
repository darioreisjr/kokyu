'use client';

import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';

import { darkColorTokens } from '../../tokens/semantic/colors';
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
        <Stack sx={{ padding: 3, flexShrink: 0 }}>
          <KokyuLogo size="md" />
        </Stack>

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
