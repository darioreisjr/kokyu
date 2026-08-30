'use client';

import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Tooltip from '@mui/material/Tooltip';
import { motion } from 'motion/react';

import { useEffectiveReducedMotion } from '../../providers/MotionPreferenceProvider';
import { navigationTokens } from '../../tokens/component/navigation';
import { sidebarCollapseMotion } from '../../tokens/semantic/motion';
import { darkColorTokens } from '../../tokens/semantic/colors';
import { KokyuLogo } from '../KokyuLogo/KokyuLogo';
import { isNavigationItemActive } from '../NavigationItem/isNavigationItemActive';
import { NavigationItem, type NavigationItemConfig } from '../NavigationItem/NavigationItem';

export interface SidebarProps {
  items: NavigationItemConfig[];
  bottomItems: NavigationItemConfig[];
  pathname: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
  logoutLabel?: string;
}

/**
 * Desktop/tablet chrome — a fixed dark brand surface (`darkColorTokens`,
 * not a theme callback), same reasoning as `AuthVisualPanel`: this is
 * Kokyu's own navigation shell, not themable content. Hidden below `md`
 * by its parent (`KokyuAppShell`), which switches to `MobileTopBar` +
 * `NavigationDrawer` instead.
 */
export function Sidebar({
  items,
  bottomItems,
  pathname,
  collapsed,
  onToggleCollapse,
  onLogout,
  logoutLabel = 'Sair',
}: SidebarProps) {
  const shouldReduceMotion = useEffectiveReducedMotion();

  return (
    <motion.aside
      aria-label="Barra lateral"
      initial={false}
      animate={{
        width: collapsed ? navigationTokens.sidebar.collapsedWidth : navigationTokens.sidebar.width,
      }}
      transition={{
        duration: shouldReduceMotion ? 0 : sidebarCollapseMotion.duration,
        ease: sidebarCollapseMotion.ease,
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100dvh',
        position: 'sticky',
        top: 0,
        overflow: 'hidden',
        backgroundColor: darkColorTokens.background.default,
        borderInlineEnd: `1px solid ${darkColorTokens.border.subtle}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          padding: '24px 16px',
          flexShrink: 0,
        }}
      >
        <KokyuLogo size={collapsed ? 'sm' : 'md'} markOnly={collapsed} />
        <Tooltip
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          placement={collapsed ? 'right' : 'bottom'}
        >
          <IconButton
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            aria-expanded={!collapsed}
            size="small"
            sx={{
              color: darkColorTokens.icon.secondary,
              '&:hover': { color: darkColorTokens.icon.primary },
              '&:focus-visible': {
                outline: `2px solid ${darkColorTokens.border.focus}`,
                outlineOffset: '2px',
              },
            }}
          >
            {collapsed ? <ChevronRightRoundedIcon /> : <ChevronLeftRoundedIcon />}
          </IconButton>
        </Tooltip>
      </div>

      <nav
        aria-label="Navegação principal"
        style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}
      >
        <List component="div" sx={{ paddingInline: 1.5 }}>
          {items.map((item) => (
            <NavigationItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={isNavigationItemActive(pathname, item.href)}
              collapsed={collapsed}
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
              collapsed={collapsed}
            />
          ))}
          <NavigationItem
            icon={LogoutRoundedIcon}
            label={logoutLabel}
            onClick={onLogout}
            collapsed={collapsed}
          />
        </List>
      </div>
    </motion.aside>
  );
}
