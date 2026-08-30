'use client';

import { useEffect, useState } from 'react';

import type { DateFormat, TimeFormat, TimezoneMode } from '../../types/preferences.types';
import {
  formatDateWithPreferences,
  formatTimeWithPreferences,
  getDetectedTimezone,
} from '../../utils/localeFormatting';
import { usePreferences } from '../../providers/PreferencesProvider';
import { SettingsGroup } from '../SettingsGroup/SettingsGroup';
import { SettingsRow } from '../SettingsRow/SettingsRow';
import { SettingsSection } from '../SettingsSection/SettingsSection';
import { SettingsSelect } from '../SettingsSelect/SettingsSelect';

const DATE_FORMAT_OPTIONS: { value: DateFormat; label: string }[] = [
  { value: 'DD/MM/AAAA', label: 'DD/MM/AAAA' },
  { value: 'MM/DD/AAAA', label: 'MM/DD/AAAA' },
  { value: 'AAAA-MM-DD', label: 'AAAA-MM-DD' },
];

const TIME_FORMAT_OPTIONS: { value: TimeFormat; label: string }[] = [
  { value: '24h', label: '24 horas' },
  { value: '12h', label: '12 horas (AM/PM)' },
];

const WEEK_START_OPTIONS = [
  { value: '0', label: 'Domingo' },
  { value: '1', label: 'Segunda-feira' },
];

const TIMEZONE_MODE_OPTIONS: { value: TimezoneMode; label: string }[] = [
  { value: 'auto', label: 'Automático (detectado pelo dispositivo)' },
  { value: 'manual', label: 'Manual' },
];

/** A curated set of Brazilian IANA zones — enough to cover every UTC offset the country actually uses. */
const MANUAL_TIMEZONE_OPTIONS = [
  { value: 'America/Noronha', label: 'Fernando de Noronha (America/Noronha)' },
  { value: 'America/Sao_Paulo', label: 'Brasília (America/Sao_Paulo)' },
  { value: 'America/Manaus', label: 'Manaus (America/Manaus)' },
  { value: 'America/Rio_Branco', label: 'Rio Branco (America/Rio_Branco)' },
];

// A fixed, illustrative instant — not `new Date()`. Server render and
// client hydration would otherwise construct it microseconds apart,
// and if that gap crossed a minute/day boundary the formatted preview
// text would mismatch between the two, tripping a real hydration
// warning over what is only ever example copy.
const previewDate = new Date(2026, 7, 28, 14, 5);

/** Settings → Idioma e região: locale-aware formatting, all funneled through `localeFormatting.ts` so it applies everywhere at once. */
export function LocaleSettings() {
  const { preferences, updateSection } = usePreferences();
  const { language, region, dateFormat, timeFormat, weekStartsOn, timezoneMode, timezone } =
    preferences.locale;

  // `Intl.DateTimeFormat().resolvedOptions().timeZone` reflects the
  // *runtime's* zone — on the server that's wherever Next.js is
  // hosted, not the visitor's. Reading it during render would make
  // the "auto" example text disagree between SSR and the client's
  // first paint; deferring it to a post-mount effect keeps that first
  // paint on the same stored/default value both environments already
  // agree on (the same trade-off `PreferencesProvider` itself makes).
  const [detectedTimezone, setDetectedTimezone] = useState<string | null>(null);
  useEffect(() => {
    queueMicrotask(() => setDetectedTimezone(getDetectedTimezone()));
  }, []);

  const resolvedTimezone =
    timezoneMode === 'auto' ? (detectedTimezone ?? preferences.locale.timezone) : timezone;

  return (
    <SettingsSection
      title="Idioma e região"
      description="Idioma, formatos e fuso horário usados em todo o Kokyu."
      autosaves
    >
      <SettingsGroup>
        <SettingsRow
          anchorId="setting-idioma-idioma"
          title="Idioma"
          description="Apenas português (Brasil) está disponível por enquanto."
          disabled
          control={
            <SettingsSelect
              label="Idioma"
              hideLabel
              value={language}
              disabled
              options={[{ value: 'pt-BR', label: 'Português (Brasil)' }]}
              onChange={() => {}}
            />
          }
        />
        <SettingsRow
          anchorId="setting-idioma-regiao"
          title="Região"
          description="Apenas Brasil está disponível por enquanto."
          disabled
          control={
            <SettingsSelect
              label="Região"
              hideLabel
              value={region}
              disabled
              options={[{ value: 'BR', label: 'Brasil' }]}
              onChange={() => {}}
            />
          }
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow
          anchorId="setting-idioma-formato-data"
          title="Formato de data"
          description={`Exemplo: ${formatDateWithPreferences(previewDate, preferences.locale)}`}
          control={
            <SettingsSelect
              label="Formato de data"
              hideLabel
              value={dateFormat}
              options={DATE_FORMAT_OPTIONS}
              onChange={(value) => updateSection('locale', { dateFormat: value as DateFormat })}
            />
          }
        />
        <SettingsRow
          anchorId="setting-idioma-formato-horario"
          title="Formato de horário"
          description={`Exemplo: ${formatTimeWithPreferences(previewDate, preferences.locale)}`}
          control={
            <SettingsSelect
              label="Formato de horário"
              hideLabel
              value={timeFormat}
              options={TIME_FORMAT_OPTIONS}
              onChange={(value) => updateSection('locale', { timeFormat: value as TimeFormat })}
            />
          }
        />
        <SettingsRow
          anchorId="setting-idioma-inicio-semana"
          title="A semana começa em"
          control={
            <SettingsSelect
              label="A semana começa em"
              hideLabel
              value={String(weekStartsOn)}
              options={WEEK_START_OPTIONS}
              onChange={(value) =>
                updateSection('locale', { weekStartsOn: Number(value) as 0 | 1 })
              }
            />
          }
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow
          anchorId="setting-idioma-fuso-horario"
          title="Fuso horário"
          description={`Exemplo: ${resolvedTimezone}`}
          control={
            <SettingsSelect
              label="Fuso horário"
              hideLabel
              value={timezoneMode}
              options={TIMEZONE_MODE_OPTIONS}
              onChange={(value) => updateSection('locale', { timezoneMode: value as TimezoneMode })}
            />
          }
        />
        {timezoneMode === 'manual' ? (
          <SettingsRow
            title="Selecionar fuso horário"
            control={
              <SettingsSelect
                label="Selecionar fuso horário"
                hideLabel
                value={timezone}
                options={MANUAL_TIMEZONE_OPTIONS}
                onChange={(value) => updateSection('locale', { timezone: value })}
              />
            }
          />
        ) : null}
      </SettingsGroup>
    </SettingsSection>
  );
}
