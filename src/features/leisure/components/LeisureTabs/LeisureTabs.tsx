'use client';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

import { themePalette } from '@/design-system/theme/useThemePalette';

import { leisureRoutes, leisureTabs } from '../../constants/leisureRoutes';

/** Same prefix-match rule as the app's own `isNavigationItemActive` — `/app/tempo-livre/biblioteca/123` keeps "Biblioteca" active, but `/app/tempo-livre` itself never prefix-matches every other tab. */
function isTabActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === leisureRoutes.today) return false;
  return pathname.startsWith(`${href}/`);
}

/** `/app/tempo-livre/item/[id]` sits outside every tab's own prefix (it's reachable from Biblioteca, Lugares or Hobbies alike) — Biblioteca is the closest "browse everything" home for it, so it's the one tab highlighted there instead of silently falling back to "Hoje". */
function isItemDetailRoute(pathname: string): boolean {
  return pathname.startsWith('/app/tempo-livre/item/');
}

/**
 * Tempo Livre's internal sub-navigation — 8 real links (no DS wrapper
 * exists for this yet), so deep linking and back/forward both work.
 * `variant="scrollable"` keeps eight tabs usable on a 320px screen
 * without wrapping or overflowing the viewport.
 */
export function LeisureTabs() {
  const pathname = usePathname();
  const activeTab = isItemDetailRoute(pathname)
    ? 'biblioteca'
    : (leisureTabs.find((tab) => isTabActive(pathname, tab.href))?.id ?? leisureTabs[0]!.id);

  return (
    <Tabs
      value={activeTab}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      aria-label="Seções de Tempo Livre"
      sx={(theme) => ({
        borderBottom: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        minHeight: 44,
      })}
    >
      {leisureTabs.map((tab) => (
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
