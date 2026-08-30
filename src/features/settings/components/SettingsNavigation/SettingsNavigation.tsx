'use client';

import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import type { ComponentType } from 'react';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { duration, easing } from '@/design-system/tokens/primitives/motion';

export interface SettingsCategoryConfig {
  id: string;
  label: string;
  icon: ComponentType<SvgIconProps>;
}

export interface SettingsNavigationProps {
  categories: SettingsCategoryConfig[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}

const transition = `background-color ${duration.fast} ${easing.standard}, color ${duration.fast} ${easing.standard}`;

/**
 * The category list for Configurações. Same markup renders both roles:
 * a persistent secondary sidebar from `sm` up, and — on `xs`, where
 * `SettingsPage` shows it only until a category is picked — the
 * full-screen category list itself. No `useMediaQuery` branch, so
 * there's nothing here that can mismatch between server and client.
 */
export function SettingsNavigation({
  categories,
  activeCategory,
  onSelectCategory,
}: SettingsNavigationProps) {
  return (
    <List
      component="nav"
      aria-label="Categorias de configurações"
      sx={{ padding: 0, width: '100%' }}
    >
      {categories.map((category) => {
        const Icon = category.icon;
        const active = category.id === activeCategory;

        return (
          <ListItemButton
            key={category.id}
            selected={active}
            aria-current={active ? 'page' : undefined}
            onClick={() => onSelectCategory(category.id)}
            sx={(theme) => ({
              position: 'relative',
              borderRadius: 2,
              marginBlockEnd: 0.5,
              paddingBlock: { xs: 1.5, sm: 1 },
              color: active
                ? themePalette(theme).kokyu.text.primary
                : themePalette(theme).kokyu.text.secondary,
              transition,
              '&::before': {
                content: '""',
                position: 'absolute',
                insetInlineStart: 0,
                top: '20%',
                bottom: '20%',
                width: '3px',
                borderRadius: 2,
                backgroundColor: themePalette(theme).kokyu.action.primary,
                opacity: active ? 1 : 0,
                transition: `opacity ${duration.fast} ${easing.standard}`,
              },
              '&:hover': { backgroundColor: themePalette(theme).kokyu.surface.secondary },
              '&.Mui-selected': {
                backgroundColor: themePalette(theme).kokyu.surface.secondary,
                '&:hover': { backgroundColor: themePalette(theme).kokyu.surface.secondary },
              },
              '&:focus-visible': {
                outline: `2px solid ${themePalette(theme).kokyu.border.focus}`,
                outlineOffset: '2px',
              },
            })}
          >
            <ListItemIcon sx={{ minWidth: 0, marginInlineEnd: 1.5, color: 'inherit' }}>
              <Icon aria-hidden="true" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={category.label}
              slotProps={{ primary: { variant: 'labelLarge', noWrap: true } }}
            />
            <ChevronRightRoundedIcon
              aria-hidden="true"
              fontSize="small"
              sx={{
                display: { xs: 'block', sm: 'none' },
                color: (theme) => themePalette(theme).kokyu.text.secondary,
              }}
            />
          </ListItemButton>
        );
      })}
    </List>
  );
}
