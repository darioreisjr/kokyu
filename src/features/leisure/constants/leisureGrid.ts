/**
 * Columns for the Tempo Livre card grids (Hobbies, Biblioteca, Lugares):
 * 2 on phones up to 6 on large screens, so covers stay a comfortable
 * size. Shared by each page's loading skeleton, so the layout doesn't
 * jump when the items arrive.
 */
export const leisureCardGridColumns = {
  xs: 'repeat(2, 1fr)',
  sm: 'repeat(3, 1fr)',
  md: 'repeat(4, 1fr)',
  lg: 'repeat(6, 1fr)',
} as const;
