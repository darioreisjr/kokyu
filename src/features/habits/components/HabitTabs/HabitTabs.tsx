'use client';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { habitRoutes, habitTabs } from '../../constants/habitRoutes';

function isTabActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === habitRoutes.today) return false;
  return pathname.startsWith(`${href}/`);
}

function isDetailOrFormRoute(pathname: string): boolean {
  if (pathname === habitRoutes.new) return true;
  if (habitTabs.some((tab) => pathname === tab.href)) return false;
  return /^\/app\/habitos\/[^/]+/.test(pathname);
}

export function HabitTabs() {
  const pathname = usePathname();

  // In full-screen focus Routine Player mode, hide the subnav tabs
  if (pathname.includes('/executar')) {
    return null;
  }

  const activeTab = isDetailOrFormRoute(pathname)
    ? 'todos'
    : (habitTabs.find((tab) => isTabActive(pathname, tab.href))?.id ?? habitTabs[0]!.id);

  return (
    <Tabs
      value={activeTab}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      aria-label="Seções de Hábitos"
      sx={(theme) => ({
        borderBottom: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        minHeight: 44,
      })}
    >
      {habitTabs.map((tab) => (
        <Tab
          key={tab.id}
          value={tab.id}
          label={tab.label}
          component={NextLink}
          href={tab.href}
          sx={{ minHeight: 44, textTransform: 'none', fontWeight: 500 }}
        />
      ))}
    </Tabs>
  );
}
