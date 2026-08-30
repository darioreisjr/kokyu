import type { AccentStyle, ContrastMode } from '@/design-system/tokens/semantic';

// Re-exported so the rest of this feature can import both preference
// and theme-parameter types from one place — the canonical definition
// still lives in the design system (`getThemeSemanticTokens`'s own
// parameters), not duplicated here.
export type { AccentStyle, ContrastMode };

/** Which theme the app follows — `system` mirrors `prefers-color-scheme` via MUI's own `useColorScheme()`. */
export type ThemeMode = 'system' | 'light' | 'dark';

export type Density = 'compact' | 'comfortable' | 'spacious';
export type TextSize = 'small' | 'default' | 'large';
export type SidebarMode = 'expanded' | 'collapsed';
export type ReducedMotionPreference = 'system' | 'reduce' | 'normal';
export type DateFormat = 'DD/MM/AAAA' | 'MM/DD/AAAA' | 'AAAA-MM-DD';
export type TimeFormat = '24h' | '12h';
export type TimezoneMode = 'auto' | 'manual';
/** Prepared, not implemented — see `AccessibilitySettings` doc comment for why. */
export type ColorAssistMode = 'default' | 'deuteranopia' | 'protanopia' | 'tritanopia';

export interface NotificationCategoryPreferences {
  [categoryId: string]: boolean;
}

export interface UserPreferences {
  general: {
    /** An `href` from `navigationItems` (e.g. `/app`, `/app/missoes`). */
    homePage: string;
    resumeLastPage: boolean;
    confirmImportantActions: boolean;
    /** Last `/app/*` route visited — written by `AuthenticatedShell` only while `resumeLastPage` is on. */
    lastVisitedPage: string | null;
  };

  appearance: {
    theme: ThemeMode;
    accent: AccentStyle;
    contrast: ContrastMode;
    density: Density;
    textSize: TextSize;
  };

  navigation: {
    sidebarMode: SidebarMode;
    rememberSidebarState: boolean;
    transitions: boolean;
  };

  locale: {
    /** Only `pt-BR` actually exists today — see `LocaleSettings`. */
    language: 'pt-BR';
    region: 'BR';
    dateFormat: DateFormat;
    timeFormat: TimeFormat;
    /** 0 = Sunday, 1 = Monday, matching `Date#getDay()`. */
    weekStartsOn: 0 | 1;
    timezoneMode: TimezoneMode;
    /** IANA identifier, e.g. `America/Sao_Paulo`. */
    timezone: string;
  };

  routine: {
    /** `HH:mm`. */
    dayStartsAt: string;
    dayEndsAt: string;
    /** 0–6, `Date#getDay()` numbering. */
    activeDays: number[];
    weekendDays: number[];
    morningSummary: boolean;
    morningSummaryTime: string;
    eveningReview: boolean;
    eveningReviewTime: string;
    focusMode: boolean;
  };

  notifications: {
    enabled: boolean;
    inApp: boolean;
    push: boolean;
    email: boolean;
    categories: NotificationCategoryPreferences;
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
  };

  sound: {
    interfaceSounds: boolean;
    completionSound: boolean;
  };

  accessibility: {
    reducedMotion: ReducedMotionPreference;
    colorAssist: ColorAssistMode;
    underlineLinks: boolean;
    enhancedFocus: boolean;
  };

  privacy: {
    usageAnalytics: boolean;
    personalizedSuggestions: boolean;
  };
}
