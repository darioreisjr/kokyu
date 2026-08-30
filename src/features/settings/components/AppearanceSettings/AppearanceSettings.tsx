'use client';

import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { spacing } from '@/design-system/tokens/primitives/spacing';

import type { AccentStyle, ContrastMode, Density, TextSize } from '../../types/preferences.types';
import { useThemeMode } from '../../hooks/useThemeMode';
import { usePreferences } from '../../providers/PreferencesProvider';
import { SettingsGroup } from '../SettingsGroup/SettingsGroup';
import { SettingsRadioGroup } from '../SettingsRadioGroup/SettingsRadioGroup';
import { SettingsSection } from '../SettingsSection/SettingsSection';

const THEME_OPTIONS = [
  { value: 'system', label: 'Sistema', description: 'Segue o tema do seu dispositivo.' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
];

const ACCENT_OPTIONS: { value: AccentStyle; label: string }[] = [
  { value: 'hinokami', label: 'Hinokami' },
  { value: 'mizu', label: 'Mizu' },
  { value: 'fuji', label: 'Fuji' },
  { value: 'kaminari', label: 'Kaminari' },
];

const CONTRAST_OPTIONS: { value: ContrastMode; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'Alto contraste' },
];

const DENSITY_OPTIONS: { value: Density; label: string; description: string }[] = [
  { value: 'compact', label: 'Compacta', description: 'Menos espaço entre os itens.' },
  { value: 'comfortable', label: 'Confortável', description: 'O equilíbrio padrão do Kokyu.' },
  { value: 'spacious', label: 'Espaçosa', description: 'Mais espaço entre os itens.' },
];

const TEXT_SIZE_OPTIONS: { value: TextSize; label: string }[] = [
  { value: 'small', label: 'Pequeno' },
  { value: 'default', label: 'Padrão' },
  { value: 'large', label: 'Grande' },
];

/**
 * Settings → Aparência. Every control here applies immediately — no
 * "Salvar" step — because they're all read straight from
 * `ThemeRegistry`/CSS attributes the moment `PreferencesProvider`
 * updates, the same mechanism the rest of the app already renders
 * with.
 */
export function AppearanceSettings() {
  const { theme, setTheme } = useThemeMode();
  const { preferences, updateSection } = usePreferences();
  const { accent, contrast, density, textSize } = preferences.appearance;

  return (
    <SettingsSection
      title="Aparência"
      description="Como o Kokyu se parece e se comporta visualmente para você."
      autosaves
    >
      <SettingsGroup>
        <SettingsRowPadding anchorId="setting-aparencia-tema">
          <SettingsRadioGroup
            legend="Tema"
            value={theme}
            options={THEME_OPTIONS}
            onChange={(value) => setTheme(value as typeof theme)}
          />
        </SettingsRowPadding>
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRowPadding anchorId="setting-aparencia-estilo-respiracao">
          <SettingsRadioGroup
            legend="Estilo de respiração"
            value={accent}
            options={ACCENT_OPTIONS}
            onChange={(value) => updateSection('appearance', { accent: value as AccentStyle })}
          />
        </SettingsRowPadding>
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRowPadding anchorId="setting-aparencia-contraste">
          <SettingsRadioGroup
            legend="Contraste"
            value={contrast}
            options={CONTRAST_OPTIONS}
            row
            onChange={(value) => updateSection('appearance', { contrast: value as ContrastMode })}
          />
        </SettingsRowPadding>
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRowPadding anchorId="setting-aparencia-densidade">
          <SettingsRadioGroup
            legend="Densidade"
            value={density}
            options={DENSITY_OPTIONS}
            onChange={(value) => updateSection('appearance', { density: value as Density })}
          />
        </SettingsRowPadding>
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRowPadding anchorId="setting-aparencia-tamanho-texto">
          <SettingsRadioGroup
            legend="Tamanho do texto"
            value={textSize}
            options={TEXT_SIZE_OPTIONS}
            onChange={(value) => updateSection('appearance', { textSize: value as TextSize })}
          />
        </SettingsRowPadding>
      </SettingsGroup>
    </SettingsSection>
  );
}

/** Gives a bare `SettingsRadioGroup` the same block padding every `SettingsRow` has, plus its search anchor. */
function SettingsRowPadding({ anchorId, children }: { anchorId: string; children: ReactNode }) {
  return (
    <Box
      id={anchorId}
      tabIndex={-1}
      sx={{
        padding: spacing[3],
        scrollMarginTop: 96,
        borderRadius: 1,
        '&:focus': {
          outline: (theme) => `2px solid ${themePalette(theme).kokyu.border.focus}`,
          outlineOffset: '-2px',
        },
      }}
    >
      {children}
    </Box>
  );
}
