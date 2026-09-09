'use client';

import LockRoundedIcon from '@mui/icons-material/LockRounded';
import Chip from '@mui/material/Chip';
import ListItemButton, { type ListItemButtonProps } from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import type { SxProps, Theme } from '@mui/material/styles';
import NextLink from 'next/link';
import type { ComponentType } from 'react';

import { navigationTokens } from '../../tokens/component/navigation';
import { duration, easing } from '../../tokens/primitives/motion';
import { darkColorTokens } from '../../tokens/semantic/colors';

/** Shape every navigation config entry (`navigationItems`, `bottomNavigationItems`) must satisfy. */
export interface NavigationItemConfig {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<SvgIconProps>;
  /**
   * Section not built yet — set from the backend's `/feature-flags/navigation`
   * (see `applyNavigationFlags`), never hardcoded here. Renders a lock icon,
   * an "Em breve" badge, and disables navigation entirely.
   */
  locked?: boolean;
}

export interface NavigationItemProps {
  icon: ComponentType<SvgIconProps>;
  label: string;
  /** Renders as a navigational link when given. */
  href?: string;
  /**
   * Extra click side-effect — fires alongside navigation when `href` is
   * set (e.g. closing `NavigationDrawer`), or is the item's only
   * behavior when it's not (e.g. "Sair", which has no route).
   */
  onClick?: () => void;
  active?: boolean;
  /** Icon-only, with the label moved into a `Tooltip` and `aria-label`. */
  collapsed?: boolean;
  /** See `NavigationItemConfig.locked`. */
  locked?: boolean;
}

const transition = `background-color ${duration.fast} ${easing.standard}, color ${duration.fast} ${easing.standard}`;

function itemSx(active: boolean, collapsed: boolean, locked: boolean): SxProps<Theme> {
  return {
    position: 'relative',
    height: navigationTokens.item.height,
    borderRadius: navigationTokens.item.radius,
    paddingInlineStart: collapsed ? 0 : 2,
    paddingInlineEnd: collapsed ? 0 : 1.5,
    justifyContent: collapsed ? 'center' : 'flex-start',
    color: active ? darkColorTokens.text.primary : darkColorTokens.text.secondary,
    opacity: locked ? 0.55 : 1,
    cursor: locked ? 'not-allowed' : 'pointer',
    transition,
    '&::before': {
      content: '""',
      position: 'absolute',
      insetInlineStart: 0,
      top: '20%',
      bottom: '20%',
      width: navigationTokens.item.activeIndicatorWidth,
      borderRadius: navigationTokens.item.radius,
      backgroundColor: darkColorTokens.action.primary,
      opacity: active ? 1 : 0,
      transition: `opacity ${duration.fast} ${easing.standard}`,
    },
    '&:hover': locked
      ? {}
      : {
          backgroundColor: darkColorTokens.background.elevated,
          color: darkColorTokens.text.primary,
        },
    '&.Mui-selected': {
      backgroundColor: darkColorTokens.background.elevated,
      '&:hover': { backgroundColor: darkColorTokens.background.elevated },
    },
    '&.Mui-disabled': {
      color: darkColorTokens.text.secondary,
    },
    '&:focus-visible': {
      outline: `2px solid ${darkColorTokens.border.focus}`,
      outlineOffset: '2px',
    },
    '& .navigation-item-icon': {
      transition: `transform ${duration.fast} ${easing.standard}`,
    },
    '&:hover .navigation-item-icon': locked ? {} : { transform: 'translateX(2px)' },
  };
}

/**
 * A single entry in `Sidebar` or `NavigationDrawer`. Fixed to the dark
 * brand palette (`darkColorTokens`) rather than a theme callback — same
 * reasoning as `AuthVisualPanel`: the sidebar surface doesn't follow
 * the app's light/dark scheme, it's Kokyu's own chrome.
 */
export function NavigationItem({
  icon: Icon,
  label,
  href,
  onClick,
  active = false,
  collapsed = false,
  locked = false,
}: NavigationItemProps) {
  // Collapsed + locked swaps the icon for a padlock — the only cue that
  // fits an 80px-wide rail with no room for a label or badge; the
  // tooltip below carries the "Em breve" text in that case.
  const DisplayIcon = locked && collapsed ? LockRoundedIcon : Icon;

  const content = (
    <>
      <ListItemIcon
        className="navigation-item-icon"
        sx={{
          minWidth: 0,
          marginInlineEnd: collapsed ? 0 : 2,
          justifyContent: 'center',
          color: 'inherit',
        }}
      >
        <DisplayIcon aria-hidden="true" sx={{ fontSize: navigationTokens.icon.size }} />
      </ListItemIcon>
      {!collapsed && (
        <ListItemText
          primary={label}
          slotProps={{ primary: { variant: 'labelLarge', noWrap: true } }}
          sx={{ minWidth: 0 }}
        />
      )}
      {locked && !collapsed && (
        <>
          <LockRoundedIcon
            aria-hidden="true"
            sx={{
              fontSize: 16,
              color: darkColorTokens.text.secondary,
              flexShrink: 0,
              marginInlineEnd: 0.75,
            }}
          />
          <Chip
            label="Em breve"
            size="small"
            sx={{
              flexShrink: 0,
              height: 20,
              fontSize: '0.6875rem',
              backgroundColor: darkColorTokens.background.elevated,
              color: darkColorTokens.text.secondary,
            }}
          />
        </>
      )}
    </>
  );

  const sharedProps: Pick<
    ListItemButtonProps,
    'selected' | 'disabled' | 'aria-current' | 'aria-label' | 'sx'
  > = {
    selected: active,
    disabled: locked,
    'aria-current': active ? 'page' : undefined,
    'aria-label': collapsed ? (locked ? `${label} — em breve` : label) : undefined,
    sx: itemSx(active, collapsed, locked),
  };

  // Locked items never navigate and never fire `onClick` — no `href`, no
  // `NextLink`, regardless of what the config says. `onClick` otherwise
  // fires either way: for a link, it's a side-effect alongside navigation
  // (e.g. `NavigationDrawer` closing itself); without `href`, it's the
  // item's only behavior (e.g. "Sair").
  const button = locked ? (
    <ListItemButton type="button" {...sharedProps}>
      {content}
    </ListItemButton>
  ) : href ? (
    <ListItemButton component={NextLink} href={href} onClick={onClick} {...sharedProps}>
      {content}
    </ListItemButton>
  ) : (
    <ListItemButton type="button" onClick={onClick} {...sharedProps}>
      {content}
    </ListItemButton>
  );

  if (!collapsed && !locked) return button;

  return (
    <Tooltip title={locked ? `${label} — em breve` : label} placement="right">
      {/* MUI disables pointer events on a disabled ListItemButton, which
          would otherwise stop the Tooltip from ever seeing hover events —
          the extra span keeps it working. */}
      <span>{button}</span>
    </Tooltip>
  );
}
