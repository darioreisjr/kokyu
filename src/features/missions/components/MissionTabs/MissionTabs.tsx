'use client';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { missionRoutes, missionTabs } from '../../constants/missionRoutes';

function isTabActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === missionRoutes.today) return false;
  return pathname.startsWith(`${href}/`);
}

export function MissionTabs() {
  const pathname = usePathname();
  const activeTab = missionTabs.find((tab) => isTabActive(pathname, tab.href))?.id ?? missionTabs[0]!.id;

  return (
    <Tabs
      value={activeTab}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      aria-label="Seções de Missões"
      sx={(theme) => ({
        borderBottom: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        minHeight: 44,
      })}
    >
      {missionTabs.map((tab) => (
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
