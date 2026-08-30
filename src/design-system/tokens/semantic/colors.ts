import {
  fuji,
  hinokami,
  kaminari,
  mizu,
  neutral,
  nichirin,
  tanjiro,
  type ColorScale,
} from '../primitives/colors';

/**
 * Semantic color tokens — the only color layer the rest of the app
 * (theme, components, features) is allowed to depend on. Each token
 * is defined once per color scheme; primitive scales never leak past
 * this file. See docs/design-system.md for the rationale.
 */
export interface SemanticColorTokens {
  background: {
    default: string;
    paper: string;
    subtle: string;
    elevated: string;
  };
  surface: {
    primary: string;
    secondary: string;
    inverse: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };
  border: {
    default: string;
    subtle: string;
    strong: string;
    focus: string;
  };
  action: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    primaryContrast: string;
    secondary: string;
    secondaryHover: string;
    secondaryActive: string;
    secondaryContrast: string;
    disabled: string;
    disabledBackground: string;
  };
  feedback: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  icon: {
    primary: string;
    secondary: string;
    disabled: string;
  };
}

export const darkColorTokens: SemanticColorTokens = {
  background: {
    default: nichirin[950],
    paper: nichirin[900],
    subtle: nichirin[800],
    elevated: nichirin[700],
  },
  surface: {
    primary: nichirin[900],
    secondary: nichirin[800],
    inverse: neutral[0],
  },
  text: {
    primary: neutral[50],
    secondary: neutral[300],
    disabled: nichirin[400],
    inverse: nichirin[950],
  },
  border: {
    default: nichirin[700],
    subtle: nichirin[800],
    strong: nichirin[500],
    focus: hinokami[400],
  },
  action: {
    primary: hinokami[500],
    primaryHover: hinokami[400],
    primaryActive: hinokami[600],
    primaryContrast: neutral[0],
    secondary: fuji[500],
    secondaryHover: fuji[400],
    secondaryActive: fuji[600],
    secondaryContrast: neutral[0],
    disabled: nichirin[500],
    disabledBackground: nichirin[700],
  },
  feedback: {
    success: tanjiro[400],
    warning: kaminari[400],
    error: hinokami[400],
    info: mizu[400],
  },
  icon: {
    primary: neutral[50],
    secondary: neutral[300],
    disabled: nichirin[500],
  },
} as const;

export const lightColorTokens: SemanticColorTokens = {
  background: {
    default: neutral[0],
    paper: neutral[0],
    subtle: neutral[50],
    elevated: neutral[0],
  },
  surface: {
    primary: neutral[0],
    secondary: neutral[50],
    inverse: nichirin[950],
  },
  text: {
    primary: nichirin[950],
    secondary: neutral[600],
    disabled: neutral[400],
    inverse: neutral[0],
  },
  border: {
    default: neutral[200],
    subtle: neutral[100],
    strong: neutral[400],
    focus: hinokami[600],
  },
  action: {
    primary: hinokami[500],
    primaryHover: hinokami[600],
    primaryActive: hinokami[700],
    primaryContrast: neutral[0],
    secondary: fuji[500],
    secondaryHover: fuji[600],
    secondaryActive: fuji[700],
    secondaryContrast: neutral[0],
    disabled: neutral[400],
    disabledBackground: neutral[200],
  },
  feedback: {
    success: tanjiro[600],
    warning: kaminari[700],
    error: hinokami[600],
    info: mizu[600],
  },
  icon: {
    primary: neutral[800],
    secondary: neutral[500],
    disabled: neutral[300],
  },
} as const;

export const semanticColors = {
  light: lightColorTokens,
  dark: darkColorTokens,
} as const;

export type ColorScheme = keyof typeof semanticColors;

/**
 * "Estilo de respiração" (Settings → Aparência) — which primitive
 * family drives the theme's `action.primary`/`border.focus`. Kept
 * here (not in `features/settings`) since it parameters this file's
 * own token builder; the settings feature imports it, not the other
 * way around.
 */
export type AccentStyle = 'hinokami' | 'mizu' | 'fuji' | 'kaminari';
export type ContrastMode = 'normal' | 'high';

const ACCENT_FAMILIES: Record<AccentStyle, ColorScale> = { hinokami, mizu, fuji, kaminari };

/** Kaminari (yellow) reads poorly with white text at the 500/600 weights the other three accents use with white fine. */
const ACCENT_ON_COLOR_TEXT: Record<AccentStyle, string> = {
  hinokami: neutral[0],
  mizu: neutral[0],
  fuji: neutral[0],
  kaminari: nichirin[950],
};

/**
 * Builds the theme's semantic tokens for a given color scheme, accent
 * and contrast level — used only by `createKokyuPalette` (the MUI
 * theme, i.e. every interactive control: buttons, links, focus rings,
 * switches). Kokyu's own fixed brand chrome (`Sidebar`,
 * `AuthVisualPanel`, ...) intentionally keeps reading `darkColorTokens`
 * directly and stays Hinokami regardless of this — the accent changes
 * "principalmente accents e ações", not the app's permanent identity.
 */
export function getThemeSemanticTokens(
  scheme: ColorScheme,
  accent: AccentStyle,
  contrast: ContrastMode,
): SemanticColorTokens {
  const base = semanticColors[scheme];
  const family = ACCENT_FAMILIES[accent];
  const onAccentText = ACCENT_ON_COLOR_TEXT[accent];

  const accented: SemanticColorTokens = {
    ...base,
    border: {
      ...base.border,
      focus: scheme === 'dark' ? family[400] : family[600],
    },
    action: {
      ...base.action,
      primary: family[500],
      primaryHover: scheme === 'dark' ? family[400] : family[600],
      primaryActive: scheme === 'dark' ? family[600] : family[700],
      primaryContrast: onAccentText,
    },
  };

  if (contrast === 'normal') return accented;

  // High contrast: strengthen borders by one step and pull secondary
  // text closer to primary — still built from the same primitive
  // scales, never a one-off color added just for this mode.
  return {
    ...accented,
    border: {
      ...accented.border,
      default: accented.border.strong,
      subtle: accented.border.default,
    },
    text: {
      ...accented.text,
      secondary: scheme === 'dark' ? neutral[50] : nichirin[950],
    },
  };
}
