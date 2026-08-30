'use client';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

import { themePalette } from '@/design-system/theme/useThemePalette';

import { goalRoutes, goalTabs } from '../../constants/goalRoutes';

/** Same prefix-match rule as `features/leisure`'s `LeisureTabs` — `/app/metas/em-andamento/x` keeps "Em andamento" active, but `/app/metas` itself never prefix-matches every other tab. */
function isTabActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === goalRoutes.overview) return false;
  return pathname.startsWith(`${href}/`);
}

/** `/app/metas/[id]`, `/app/metas/nova` and `/app/metas/[id]/editar` sit outside every tab's own prefix — "Em andamento" is the closest "browse goals" home for them. */
function isDetailOrFormRoute(pathname: string): boolean {
  if (pathname === goalRoutes.new) return true;
  if (goalTabs.some((tab) => pathname === tab.href)) return false;
  return /^\/app\/metas\/[^/]+/.test(pathname);
}

/** Metas' internal sub-navigation — 6 real links (no DS Tabs wrapper exists), so deep linking and back/forward both work. `variant="scrollable"` keeps six tabs usable on a 320px screen. */
export function GoalTabs() {
  const pathname = usePathname();
  const activeTab = isDetailOrFormRoute(pathname)
    ? 'em-andamento'
    : (goalTabs.find((tab) => isTabActive(pathname, tab.href))?.id ?? goalTabs[0]!.id);

  return (
    <Tabs
      value={activeTab}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      aria-label="Seções de Metas"
      sx={(theme) => ({
        borderBottom: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        minHeight: 44,
      })}
    >
      {goalTabs.map((tab) => (
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
