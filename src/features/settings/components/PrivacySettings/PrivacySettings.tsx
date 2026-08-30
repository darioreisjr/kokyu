'use client';

import { usePreferences } from '../../providers/PreferencesProvider';
import { SettingsGroup } from '../SettingsGroup/SettingsGroup';
import { SettingsRow } from '../SettingsRow/SettingsRow';
import { SettingsSection } from '../SettingsSection/SettingsSection';
import { SettingsToggle } from '../SettingsToggle/SettingsToggle';

/**
 * Settings → Privacidade. No analytics or recommendation engine exists
 * in Kokyu yet — both preferences below are stored for when they do,
 * not wired to anything real today. Nothing is tracked either way.
 */
export function PrivacySettings() {
  const { preferences, updateSection } = usePreferences();
  const { usageAnalytics, personalizedSuggestions } = preferences.privacy;

  return (
    <SettingsSection
      title="Privacidade"
      description="O Kokyu ainda não coleta dados de uso — estas preferências ficam prontas para quando houver algo real para elas controlarem."
      autosaves
    >
      <SettingsGroup>
        <SettingsRow
          anchorId="setting-privacidade-dados-uso"
          title="Dados de uso"
          description="Preparado para uma futura análise de uso do Kokyu — nada é coletado hoje."
          control={
            <SettingsToggle
              label="Dados de uso"
              checked={usageAnalytics}
              onChange={(checked) => updateSection('privacy', { usageAnalytics: checked })}
            />
          }
        />
        <SettingsRow
          anchorId="setting-privacidade-sugestoes"
          title="Usar minha atividade para personalizar sugestões"
          description="Preparado para futuras recomendações — o Kokyu ainda não sugere nada com base na sua atividade."
          control={
            <SettingsToggle
              label="Usar minha atividade para personalizar sugestões"
              checked={personalizedSuggestions}
              onChange={(checked) => updateSection('privacy', { personalizedSuggestions: checked })}
            />
          }
        />
      </SettingsGroup>
    </SettingsSection>
  );
}
