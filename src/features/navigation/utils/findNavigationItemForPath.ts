import { isNavigationItemActive, type NavigationItemConfig } from '@/design-system/components';

/**
 * Which configured item (top or bottom) owns a given `/app/**` path —
 * used server-side (`app/app/layout.tsx`) to decide whether the route
 * being requested is locked, the same prefix-match `Sidebar`/
 * `NavigationDrawer` use to highlight the active item on the client.
 */
export function findNavigationItemForPath(
  pathname: string,
  items: NavigationItemConfig[],
): NavigationItemConfig | undefined {
  return items.find((item) => isNavigationItemActive(pathname, item.href));
}
