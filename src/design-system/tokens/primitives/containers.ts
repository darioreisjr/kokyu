/** Kokyu Design System — container width tokens. */
export const container = {
  xs: '480px',
  sm: '600px',
  md: '900px',
  lg: '1200px',
  xl: '1536px',
} as const;

/** Content-specific max-widths that don't belong on the generic scale. */
export const content = {
  loginMaxWidth: '420px',
} as const;

export type ContainerToken = keyof typeof container;
