/**
 * `next/font/google` only works through Next's own build pipeline.
 * Vitest runs on Vite instead, so every font loader is stubbed here —
 * aliased in `vitest.config.ts` — to the shape `theme/fonts.ts` needs.
 */
function createFontLoader() {
  return () => ({
    className: 'kokyu-font-mock',
    variable: '--font-kokyu-mock',
    style: { fontFamily: 'sans-serif' },
  });
}

export const Inter = createFontLoader();
export const Manrope = createFontLoader();
