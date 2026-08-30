/**
 * Kokyu Design System — z-index tokens.
 * Mirrors MUI's own layering scale so Kokyu components and MUI
 * components (Modal, Drawer, Tooltip, ...) never fight for a layer.
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  drawer: 1200,
  modal: 1300,
  popover: 1400,
  tooltip: 1500,
  toast: 1600,
} as const;

export type ZIndexToken = keyof typeof zIndex;
