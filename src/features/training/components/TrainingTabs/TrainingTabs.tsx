'use client';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

import { themePalette } from '@/design-system/theme/useThemePalette';

import { trainingRoutes, trainingTabs } from '../../constants/trainingRoutes';

function isTabActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === trainingRoutes.today) return false;
  return pathname.startsWith(`${href}/`);
}

/**
 * Hidden on `/sessao/*` — the active-workout screen is deliberately immersive (full width, no
 * ancestor chrome), a documented deviation from every other feature keeping its tabs visible on
 * detail routes (see `docs/training.md`).
 */
export function TrainingTabs() {
  const pathname = usePathname();
  if (pathname.startsWith('/app/treinamento/sessao/')) return null;

  const activeTab =
    trainingTabs.find((tab) => isTabActive(pathname, tab.href))?.id ?? trainingTabs[0]!.id;

  return (
    <Tabs
      value={activeTab}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      aria-label="Seções de Treinamento"
      sx={(theme) => ({
        borderBottom: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        minHeight: 44,
      })}
    >
      {trainingTabs.map((tab) => (
        <Tab
          key={tab.id}
          value={tab.id}
          label={tab.label}
          component={NextLink}
          href={tab.href}
          sx={{ minHeight: 44, textTransform: 'none' }}
        />
      ))}
    </Tabs>
  );
}
