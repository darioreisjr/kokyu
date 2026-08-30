'use client';

import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { KokyuTextField } from '@/design-system/components';

import { usePreferences } from '../../providers/PreferencesProvider';
import { SettingsGroup } from '../SettingsGroup/SettingsGroup';
import { SettingsRow } from '../SettingsRow/SettingsRow';
import { SettingsSection } from '../SettingsSection/SettingsSection';
import { SettingsToggle } from '../SettingsToggle/SettingsToggle';

const WEEKDAY_LABELS: { value: number; short: string; full: string }[] = [
  { value: 0, short: 'D', full: 'Domingo' },
  { value: 1, short: 'S', full: 'Segunda-feira' },
  { value: 2, short: 'T', full: 'Terça-feira' },
  { value: 3, short: 'Q', full: 'Quarta-feira' },
  { value: 4, short: 'Q', full: 'Quinta-feira' },
  { value: 5, short: 'S', full: 'Sexta-feira' },
  { value: 6, short: 'S', full: 'Sábado' },
];

interface WeekdayPickerProps {
  ariaLabel: string;
  value: number[];
  onChange: (days: number[]) => void;
}

/** Shared by "Dias da semana" and "Meu fim de semana" — both pick a subset of the same 7 days, just with different meaning. */
function WeekdayPicker({ ariaLabel, value, onChange }: WeekdayPickerProps) {
  return (
    <ToggleButtonGroup
      value={value.map(String)}
      onChange={(_event, next: string[]) => onChange(next.map(Number).sort())}
      aria-label={ariaLabel}
      size="small"
    >
      {WEEKDAY_LABELS.map((day) => (
        <ToggleButton key={day.value} value={String(day.value)} aria-label={day.full}>
          {day.short}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

interface TimeFieldProps {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

function TimeField({ label, value, disabled, onChange }: TimeFieldProps) {
  return (
    <KokyuTextField
      type="time"
      label={label}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      size="small"
      slotProps={{ inputLabel: { shrink: true } }}
      sx={{ minWidth: { xs: '100%', sm: 160 } }}
    />
  );
}

/** Settings → Rotina: the distinctly-Kokyu section — the user's own daily rhythm, not a generic app preference. */
export function RoutineSettings() {
  const { preferences, updateSection } = usePreferences();
  const {
    dayStartsAt,
    dayEndsAt,
    activeDays,
    weekendDays,
    morningSummary,
    morningSummaryTime,
    eveningReview,
    eveningReviewTime,
    focusMode,
  } = preferences.routine;

  return (
    <SettingsSection
      title="Rotina"
      description="O ritmo do seu dia dentro do Kokyu — não presumimos que o seu é igual ao de todo mundo."
      autosaves
    >
      <SettingsGroup title="Dia">
        <SettingsRow
          anchorId="setting-rotina-inicio-dia"
          title="Início do dia"
          control={
            <TimeField
              label="Início do dia"
              value={dayStartsAt}
              onChange={(value) => updateSection('routine', { dayStartsAt: value })}
            />
          }
        />
        <SettingsRow
          anchorId="setting-rotina-fim-dia"
          title="Fim do dia"
          control={
            <TimeField
              label="Fim do dia"
              value={dayEndsAt}
              onChange={(value) => updateSection('routine', { dayEndsAt: value })}
            />
          }
        />
      </SettingsGroup>

      <SettingsGroup title="Dias">
        <SettingsRow
          anchorId="setting-rotina-dias-semana"
          title="Dias da semana"
          description="Quais dias contam como parte da sua rotina ativa."
          control={
            <WeekdayPicker
              ariaLabel="Dias da semana ativos"
              value={activeDays}
              onChange={(days) => updateSection('routine', { activeDays: days })}
            />
          }
        />
        <SettingsRow
          anchorId="setting-rotina-fim-semana"
          title="Meu fim de semana"
          description="Nem todo mundo folga no mesmo dia — ajuste ao seu."
          control={
            <WeekdayPicker
              ariaLabel="Dias de fim de semana"
              value={weekendDays}
              onChange={(days) => updateSection('routine', { weekendDays: days })}
            />
          }
        />
      </SettingsGroup>

      <SettingsGroup title="Resumos">
        <SettingsRow
          anchorId="setting-rotina-resumo-manha"
          title="Resumo da manhã"
          description="Um resumo do seu dia, por exemplo às 07:00."
          control={
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
            >
              <TimeField
                label="Horário do resumo da manhã"
                value={morningSummaryTime}
                disabled={!morningSummary}
                onChange={(value) => updateSection('routine', { morningSummaryTime: value })}
              />
              <SettingsToggle
                label="Resumo da manhã"
                checked={morningSummary}
                onChange={(checked) => updateSection('routine', { morningSummary: checked })}
              />
            </Stack>
          }
        />
        <SettingsRow
          anchorId="setting-rotina-revisao-noturna"
          title="Revisão noturna"
          description="Uma revisão do seu dia, por exemplo às 21:00."
          control={
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
            >
              <TimeField
                label="Horário da revisão noturna"
                value={eveningReviewTime}
                disabled={!eveningReview}
                onChange={(value) => updateSection('routine', { eveningReviewTime: value })}
              />
              <SettingsToggle
                label="Revisão noturna"
                checked={eveningReview}
                onChange={(checked) => updateSection('routine', { eveningReview: checked })}
              />
            </Stack>
          }
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow
          anchorId="setting-rotina-modo-foco"
          title="Modo foco"
          description="Preparado para uma futura experiência de foco no Kokyu — ainda não altera nada visualmente."
          control={
            <SettingsToggle
              label="Modo foco"
              checked={focusMode}
              onChange={(checked) => updateSection('routine', { focusMode: checked })}
            />
          }
        />
      </SettingsGroup>
    </SettingsSection>
  );
}
