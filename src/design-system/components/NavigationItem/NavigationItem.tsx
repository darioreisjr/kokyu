'use client';

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
}

const transition = `background-color ${duration.fast} ${easing.standard}, color ${duration.fast} ${easing.standard}`;

function itemSx(active: boolean, collapsed: boolean): SxProps<Theme> {
  return {
    position: 'relative',
    height: navigationTokens.item.height,
    borderRadius: navigationTokens.item.radius,
    paddingInlineStart: collapsed ? 0 : 2,
    justifyContent: collapsed ? 'center' : 'flex-start',
    color: active ? darkColorTokens.text.primary : darkColorTokens.text.secondary,
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
    '&:hover': {
      backgroundColor: darkColorTokens.background.elevated,
      color: darkColorTokens.text.primary,
    },
    '&.Mui-selected': {
      backgroundColor: darkColorTokens.background.elevated,
      '&:hover': { backgroundColor: darkColorTokens.background.elevated },
    },
    '&:focus-visible': {
      outline: `2px solid ${darkColorTokens.border.focus}`,
      outlineOffset: '2px',
    },
    '& .navigation-item-icon': {
      transition: `transform ${duration.fast} ${easing.standard}`,
    },
    '&:hover .navigation-item-icon': {
      transform: 'translateX(2px)',
    },
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
}: NavigationItemProps) {
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
        <Icon aria-hidden="true" sx={{ fontSize: navigationTokens.icon.size }} />
      </ListItemIcon>
      {!collapsed && (
        <ListItemText
          primary={label}
          slotProps={{ primary: { variant: 'labelLarge', noWrap: true } }}
        />
      )}
    </>
  );

  const sharedProps: Pick<ListItemButtonProps, 'selected' | 'aria-current' | 'aria-label' | 'sx'> =
    {
      selected: active,
      'aria-current': active ? 'page' : undefined,
      'aria-label': collapsed ? label : undefined,
      sx: itemSx(active, collapsed),
    };

  // `onClick` fires either way — for a link, it's a side-effect alongside
  // navigation (e.g. `NavigationDrawer` closing itself); without `href`,
  // it's the only thing the item does at all (e.g. "Sair").
  const button = href ? (
    <ListItemButton component={NextLink} href={href} onClick={onClick} {...sharedProps}>
      {content}
    </ListItemButton>
  ) : (
    <ListItemButton type="button" onClick={onClick} {...sharedProps}>
      {content}
    </ListItemButton>
  );

  if (!collapsed) return button;

  return (
    <Tooltip title={label} placement="right">
      {button}
    </Tooltip>
  );
}
