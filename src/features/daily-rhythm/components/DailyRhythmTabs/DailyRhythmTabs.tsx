'use client';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { dailyRhythmRoutes, dailyRhythmTabs } from '../../constants/dailyRhythmRoutes';

function isTabActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === dailyRhythmRoutes.today) return false;
  return pathname.startsWith(`${href}/`);
}

export function DailyRhythmTabs() {
  const pathname = usePathname();

  // If inside focused player mode, hide subnav tabs
  if (pathname.includes('/foco/executar')) {
    return null;
  }

  const activeTab =
    dailyRhythmTabs.find((tab) => isTabActive(pathname, tab.href))?.id ?? dailyRhythmTabs[0]!.id;

  return (
    <Tabs
      value={activeTab}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      aria-label="Seções do Ritmo Diário"
      sx={(theme) => ({
        borderBottom: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        minHeight: 44,
        mb: 3,
      })}
    >
      {dailyRhythmTabs.map((tab) => (
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

