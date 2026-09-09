import type { NavigationItemConfig } from '@/design-system/components';

/**
 * Decorates each item with `locked` from the backend's
 * `GET /feature-flags/navigation` (see `getNavigationFlagsServer`).
 * Anything missing from `flags` — a section added on the frontend before
 * the backend knows about it — defaults to locked, never the other way
 * around: an unrecognized id must never accidentally unlock a route.
 */
export function applyNavigationFlags(
  items: NavigationItemConfig[],
  flags: Record<string, boolean>,
): NavigationItemConfig[] {
  return items.map((item) => ({ ...item, locked: flags[item.id] !== true }));
}
