/**
 * Kokyu Design System — primitive color tokens.
 *
 * These are raw color values only. Nothing in the application should
 * reference these scales directly — consume `semantic` color tokens
 * instead. See docs/design-system.md for the meaning of each family.
 */

export type ColorScale = {
  readonly 50: string;
  readonly 100: string;
  readonly 200: string;
  readonly 300: string;
  readonly 400: string;
  readonly 500: string;
  readonly 600: string;
  readonly 700: string;
  readonly 800: string;
  readonly 900: string;
  readonly 950: string;
};

export type NeutralScale = ColorScale & {
  readonly 0: string;
  readonly 1000: string;
};

/** True neutral gray. Used for text, icons and borders. */
export const neutral: NeutralScale = {
  0: '#FFFFFF',
  50: '#F7F7F8',
  100: '#EDEDEF',
  200: '#DBDCE0',
  300: '#C1C2C9',
  400: '#9C9DA6',
  500: '#797B85',
  600: '#5D5F69',
  700: '#46474F',
  800: '#313239',
  900: '#1F2025',
  950: '#16171B',
  1000: '#0D0D10',
} as const;

/** Cool steel-blue dark scale. Depth and surfaces — the app's backbone. */
export const nichirin: ColorScale = {
  50: '#EEF1F5',
  100: '#DCE1E9',
  200: '#BAC3D1',
  300: '#8F9BAF',
  400: '#647087',
  500: '#4A5468',
  600: '#384155',
  700: '#2A3142',
  800: '#1E2330',
  900: '#151822',
  950: '#0D0F16',
} as const;

/** Red / orange. Primary action, energy and progress. */
export const hinokami: ColorScale = {
  50: '#FFF2ED',
  100: '#FFDFD1',
  200: '#FFBEA3',
  300: '#FF9670',
  400: '#FF6B3D',
  500: '#F4491F',
  600: '#D93615',
  700: '#B02A12',
  800: '#872213',
  900: '#5E1B12',
  950: '#380F09',
} as const;

/** Blue. Calm, information and concentration. */
export const mizu: ColorScale = {
  50: '#EEF7FF',
  100: '#D6ECFF',
  200: '#ADD9FF',
  300: '#79C0FF',
  400: '#47A3FF',
  500: '#1D84F5',
  600: '#0F68D1',
  700: '#0F52A6',
  800: '#12437F',
  900: '#123A63',
  950: '#0B213A',
} as const;

/** Yellow. Attention and highlight — used sparingly. */
export const kaminari: ColorScale = {
  50: '#FFFBE6',
  100: '#FFF3BF',
  200: '#FFE685',
  300: '#FFD54A',
  400: '#FDC520',
  500: '#F0AC00',
  600: '#CC8E00',
  700: '#A37102',
  800: '#7A5606',
  900: '#5C4108',
  950: '#332304',
} as const;

/** Purple / wisteria. Secondary identity and protection. */
export const fuji: ColorScale = {
  50: '#F6EFFF',
  100: '#E7D7FF',
  200: '#D0B2FF',
  300: '#B587FF',
  400: '#9A5FF7',
  500: '#8140E8',
  600: '#6A2FC9',
  700: '#55259F',
  800: '#421E79',
  900: '#331859',
  950: '#1D0D34',
} as const;

/** Green. Success and evolution. */
export const tanjiro: ColorScale = {
  50: '#EDFCF3',
  100: '#D2F7E0',
  200: '#A3EFC2',
  300: '#6BE09E',
  400: '#3BC97E',
  500: '#1FAC63',
  600: '#148A4F',
  700: '#106D40',
  800: '#115634',
  900: '#10462B',
  950: '#072819',
} as const;

/** Pink. Optional emotional accent. */
export const nezuko: ColorScale = {
  50: '#FFF0F6',
  100: '#FFDCE9',
  200: '#FFB3D1',
  300: '#FF80B2',
  400: '#FA4F92',
  500: '#EE2578',
  600: '#C81762',
  700: '#A11251',
  800: '#7C1141',
  900: '#5F1234',
  950: '#370A1D',
} as const;

/** Orange. Intensity and energy — distinct from Hinokami's red-orange. */
export const rengoku: ColorScale = {
  50: '#FFF5E6',
  100: '#FFE4BF',
  200: '#FFC780',
  300: '#FFA63D',
  400: '#FF8A0A',
  500: '#F27200',
  600: '#CC5E00',
  700: '#A34B02',
  800: '#7A3A07',
  900: '#5C2C08',
  950: '#331704',
} as const;

export const colorPrimitives = {
  neutral,
  nichirin,
  hinokami,
  mizu,
  kaminari,
  fuji,
  tanjiro,
  nezuko,
  rengoku,
} as const;

export type ColorFamily = keyof typeof colorPrimitives;
