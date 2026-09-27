/**
 * Columns for the Tempo Livre card grids (Hobbies, Biblioteca, Lugares):
 * 2 on phones up to 6 on large screens, so covers stay a comfortable
 * size. Shared by each page's loading skeleton, so the layout doesn't
 * jump when the items arrive.
 *
 * `minmax(0, 1fr)`, not `1fr`: a bare `1fr` is `minmax(auto, 1fr)`, so a
 * long single-line title widened its own column - and, with the cover's
 * fixed aspect ratio, made that card taller than the rest.
 */
export const leisureCardGridColumns = {
  xs: 'repeat(2, minmax(0, 1fr))',
  sm: 'repeat(3, minmax(0, 1fr))',
  md: 'repeat(4, minmax(0, 1fr))',
  lg: 'repeat(6, minmax(0, 1fr))',
} as const;

/** Every row as tall as the tallest one, so all cards share one height (cards stretch to fill). */
export const leisureCardGridAutoRows = '1fr';
