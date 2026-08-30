export { PreferencesProvider, usePreferences } from './providers/PreferencesProvider';
export { useThemeMode } from './hooks/useThemeMode';
export { defaultPreferences } from './constants/defaultPreferences';
export { notificationCategoryGroups } from './constants/notificationCategories';
export {
  formatDateWithPreferences,
  formatTimeWithPreferences,
  getDetectedTimezone,
  resolveTimezone,
} from './utils/localeFormatting';
export type {
  UserPreferences,
  ThemeMode,
  AccentStyle,
  ContrastMode,
  Density,
  TextSize,
  SidebarMode,
  ReducedMotionPreference,
  DateFormat,
  TimeFormat,
  TimezoneMode,
  ColorAssistMode,
} from './types/preferences.types';

export { SettingsRow, type SettingsRowProps } from './components/SettingsRow/SettingsRow';
export { SettingsGroup, type SettingsGroupProps } from './components/SettingsGroup/SettingsGroup';
export {
  SettingsSection,
  type SettingsSectionProps,
} from './components/SettingsSection/SettingsSection';
export {
  SettingsToggle,
  type SettingsToggleProps,
} from './components/SettingsToggle/SettingsToggle';
export {
  SettingsSelect,
  type SettingsSelectProps,
  type SettingsSelectOption,
} from './components/SettingsSelect/SettingsSelect';
export {
  SettingsRadioGroup,
  type SettingsRadioGroupProps,
  type SettingsRadioOption,
} from './components/SettingsRadioGroup/SettingsRadioGroup';
export {
  SettingsNavigation,
  type SettingsNavigationProps,
  type SettingsCategoryConfig,
} from './components/SettingsNavigation/SettingsNavigation';
export {
  SettingsDangerZone,
  type SettingsDangerZoneProps,
} from './components/SettingsDangerZone/SettingsDangerZone';

// `SettingsPage` and the 14 category components (`GeneralSettings`,
// `AppearanceSettings`, ...) are deliberately NOT re-exported here.
// They're the only things in this feature that reach into
// `features/profile`/`features/navigation`, and this barrel is what
// `AuthenticatedShell`, `AuthTransition` and `useLoginForm` import
// `usePreferences` from — every one of them rendered on (or gating)
// nearly every route. Exporting the page here once made importing
// `usePreferences` anywhere pull in all 14 category screens (avatar
// cropper included) transitively, bloating those bundles and, in
// `AuthenticatedShell.test.tsx`, breaking an unrelated test whose
// partial `features/auth` mock had no reason to expect being pulled
// that deep. `app/app/configuracoes/page.tsx` imports `SettingsPage`
// straight from `./components/SettingsPage/SettingsPage` instead.
export { settingsCategories, DEFAULT_SETTINGS_CATEGORY } from './constants/settingsCategories';
export { settingsSearchIndex, type SettingsSearchEntry } from './constants/searchIndex';
export { searchSettings, type SettingsSearchResult } from './utils/searchSettings';
