'use client';

import Box from '@mui/material/Box';
import NextLink from 'next/link';
import type { ReactNode } from 'react';

import { KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { spacing } from '@/design-system/tokens/primitives/spacing';

import type { ColorAssistMode, ReducedMotionPreference } from '../../types/preferences.types';
import { usePreferences } from '../../providers/PreferencesProvider';
import { SettingsGroup } from '../SettingsGroup/SettingsGroup';
import { SettingsRadioGroup } from '../SettingsRadioGroup/SettingsRadioGroup';
import { SettingsRow } from '../SettingsRow/SettingsRow';
import { SettingsSection } from '../SettingsSection/SettingsSection';
import { SettingsSelect } from '../SettingsSelect/SettingsSelect';
import { SettingsToggle } from '../SettingsToggle/SettingsToggle';

const REDUCED_MOTION_OPTIONS: {
  value: ReducedMotionPreference;
  label: string;
  description?: string;
}[] = [
  {
    value: 'system',
    label: 'Seguir sistema',
    description: 'Usa a preferência do seu dispositivo.',
  },
  { value: 'reduce', label: 'Reduzir' },
  { value: 'normal', label: 'Normal' },
];

const COLOR_ASSIST_OPTIONS: { value: ColorAssistMode; label: string }[] = [
  { value: 'default', label: 'Padrão' },
  { value: 'deuteranopia', label: 'Deuteranopia' },
  { value: 'protanopia', label: 'Protanopia' },
  { value: 'tritanopia', label: 'Tritanopia' },
];

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

/**
 * Settings → Acessibilidade. "Alto contraste" and "Tamanho do texto"
 * deliberately don't own state here — they read/write (or link to)
 * the exact same `preferences.appearance` fields Aparência does, so
 * there's one source of truth, not two that can disagree.
 */
export function AccessibilitySettings() {
  const { preferences, updateSection } = usePreferences();
  const { reducedMotion, colorAssist, underlineLinks, enhancedFocus } = preferences.accessibility;
  const { contrast } = preferences.appearance;

  return (
    <SettingsSection
      title="Acessibilidade"
      description="Movimento, contraste, cores e foco — sempre respeitando o que o seu sistema já pede."
      autosaves
    >
      <SettingsGroup>
        <SettingsRowPadding anchorId="setting-acessibilidade-reduzir-movimento">
          <SettingsRadioGroup
            legend="Reduzir movimento"
            value={reducedMotion}
            options={REDUCED_MOTION_OPTIONS}
            onChange={(value) =>
              updateSection('accessibility', { reducedMotion: value as ReducedMotionPreference })
            }
          />
        </SettingsRowPadding>
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow
          anchorId="setting-acessibilidade-alto-contraste"
          title="Alto contraste"
          description="O mesmo controle de Aparência → Contraste."
          control={
            <SettingsToggle
              label="Alto contraste"
              checked={contrast === 'high'}
              onChange={(checked) =>
                updateSection('appearance', { contrast: checked ? 'high' : 'normal' })
              }
            />
          }
        />
        <SettingsRow
          anchorId="setting-acessibilidade-cores-assistidas"
          title="Cores assistidas"
          description="Em preparação — ainda não altera as cores do Kokyu."
          disabled
          control={
            <SettingsSelect
              label="Cores assistidas"
              hideLabel
              value={colorAssist}
              disabled
              options={COLOR_ASSIST_OPTIONS}
              onChange={() => {}}
            />
          }
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow
          anchorId="setting-acessibilidade-sublinhar-links"
          title="Sublinhar links"
          description="Mantém os links sempre sublinhados, não só ao passar o mouse."
          control={
            <SettingsToggle
              label="Sublinhar links"
              checked={underlineLinks}
              onChange={(checked) => updateSection('accessibility', { underlineLinks: checked })}
            />
          }
        />
        <SettingsRow
          anchorId="setting-acessibilidade-foco-reforcado"
          title="Foco reforçado"
          description="Deixa o contorno de foco mais visível ao navegar pelo teclado. Nunca remove o foco padrão quando desativado."
          control={
            <SettingsToggle
              label="Foco reforçado"
              checked={enhancedFocus}
              onChange={(checked) => updateSection('accessibility', { enhancedFocus: checked })}
            />
          }
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow
          anchorId="setting-acessibilidade-tamanho-texto"
          title="Tamanho do texto"
          description="O mesmo controle de Aparência → Tamanho do texto."
          control={
            <KokyuButton
              component={NextLink}
              href="/app/configuracoes?section=aparencia#setting-aparencia-tamanho-texto"
              variant="outlined"
              size="small"
            >
              Ir para Aparência
            </KokyuButton>
          }
        />
      </SettingsGroup>
    </SettingsSection>
  );
}
