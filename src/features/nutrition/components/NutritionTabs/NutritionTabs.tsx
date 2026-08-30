'use client';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

import { themePalette } from '@/design-system/theme/useThemePalette';

import { nutritionRoutes, nutritionTabs } from '../../constants/nutritionRoutes';

/** Same prefix-match rule as the app's own `isNavigationItemActive` — `/app/nutricao/receitas/123` keeps "Receitas" active, but `/app/nutricao` itself never prefix-matches every other tab. */
function isTabActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === nutritionRoutes.today) return false;
  return pathname.startsWith(`${href}/`);
}

/**
 * Nutrição's internal sub-navigation — a real `Tabs`/`Tab` pair (no DS
 * wrapper exists for this yet), each `Tab` a genuine link so deep
 * linking and back/forward both work. `variant="scrollable"` is what
 * keeps five tabs usable on a 320px screen without wrapping or
 * overflowing the viewport.
 */
export function NutritionTabs() {
  const pathname = usePathname();
  const activeTab =
    nutritionTabs.find((tab) => isTabActive(pathname, tab.href))?.id ?? nutritionTabs[0]!.id;

  return (
    <Tabs
      value={activeTab}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      aria-label="Seções de Nutrição"
      sx={(theme) => ({
        borderBottom: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        minHeight: 44,
      })}
    >
      {nutritionTabs.map((tab) => (
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
