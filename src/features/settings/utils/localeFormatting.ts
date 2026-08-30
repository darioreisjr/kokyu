import { format } from 'date-fns';

import type { UserPreferences } from '../types/preferences.types';

type LocalePreferences = UserPreferences['locale'];

const DATE_FORMAT_PATTERNS: Record<LocalePreferences['dateFormat'], string> = {
  'DD/MM/AAAA': 'dd/MM/yyyy',
  'MM/DD/AAAA': 'MM/dd/yyyy',
  'AAAA-MM-DD': 'yyyy-MM-dd',
};

const TIME_FORMAT_PATTERNS: Record<LocalePreferences['timeFormat'], string> = {
  '24h': 'HH:mm',
  '12h': 'hh:mm a',
};

/**
 * The one place a date/time ever gets formatted for display — call
 * this instead of a component picking its own `date-fns` pattern, so
 * "Formato de data"/"Formato de horário" (Settings → Idioma e região)
 * actually change every date the app shows, not just the ones someone
 * remembered to wire up.
 */
export function formatDateWithPreferences(date: Date, locale: LocalePreferences): string {
  return format(date, DATE_FORMAT_PATTERNS[locale.dateFormat]);
}

export function formatTimeWithPreferences(date: Date, locale: LocalePreferences): string {
  return format(date, TIME_FORMAT_PATTERNS[locale.timeFormat]);
}

/** The browser's own IANA zone — never derived from the raw UTC offset, which DST/regional rules can change. */
export function getDetectedTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

export function resolveTimezone(locale: LocalePreferences): string {
  return locale.timezoneMode === 'auto' ? getDetectedTimezone() : locale.timezone;
}
