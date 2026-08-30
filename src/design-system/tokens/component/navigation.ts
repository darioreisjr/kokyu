import { borderRadius } from '../primitives/borders';

/**
 * Sizing for the authenticated shell's sidebar/drawer/nav items. Colors
 * are deliberately not duplicated here — the sidebar is a fixed dark
 * brand surface (see `Sidebar`, same reasoning as `AuthVisualPanel`),
 * so components read `darkColorTokens`/semantic action tokens directly
 * instead of a redundant color layer in this file.
 */
export const navigationTokens = {
  sidebar: {
    width: '260px',
    collapsedWidth: '80px',
  },
  topBar: {
    height: '56px',
  },
  item: {
    height: '44px',
    radius: borderRadius.md,
    activeIndicatorWidth: '3px',
  },
  icon: {
    size: '22px',
  },
} as const;
