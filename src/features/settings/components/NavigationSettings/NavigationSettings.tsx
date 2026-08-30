'use client';

import type { SidebarMode } from '../../types/preferences.types';
import { usePreferences } from '../../providers/PreferencesProvider';
import { SettingsGroup } from '../SettingsGroup/SettingsGroup';
import { SettingsRow } from '../SettingsRow/SettingsRow';
import { SettingsSection } from '../SettingsSection/SettingsSection';
import { SettingsSelect } from '../SettingsSelect/SettingsSelect';
import { SettingsToggle } from '../SettingsToggle/SettingsToggle';

const SIDEBAR_MODE_OPTIONS = [
  { value: 'expanded', label: 'Expandido' },
  { value: 'collapsed', label: 'Recolhido' },
];

/** Settings → Navegação: how the sidebar and page transitions behave. */
export function NavigationSettings() {
  const { preferences, updateSection } = usePreferences();
  const { sidebarMode, rememberSidebarState, transitions } = preferences.navigation;

  return (
    <SettingsSection
      title="Navegação"
      description="Como o menu lateral e a troca entre páginas se comportam."
      autosaves
    >
      <SettingsGroup>
        <SettingsRow
          anchorId="setting-navegacao-menu-lateral"
          title="Menu lateral"
          description="Estado padrão do menu em telas maiores."
          control={
            <SettingsSelect
              label="Menu lateral"
              hideLabel
              value={sidebarMode}
              options={SIDEBAR_MODE_OPTIONS}
              onChange={(value) =>
                updateSection('navigation', { sidebarMode: value as SidebarMode })
              }
            />
          }
        />
        <SettingsRow
          anchorId="setting-navegacao-lembrar-estado"
          title="Lembrar estado do menu"
          description="Mantém a última escolha (expandido ou recolhido) entre sessões."
          control={
            <SettingsToggle
              label="Lembrar estado do menu"
              checked={rememberSidebarState}
              onChange={(checked) => updateSection('navigation', { rememberSidebarState: checked })}
            />
          }
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow
          anchorId="setting-navegacao-transicoes"
          title="Transições entre páginas"
          description="Anima a troca de tela. Desativada automaticamente se o seu sistema pedir menos movimento."
          control={
            <SettingsToggle
              label="Transições entre páginas"
              checked={transitions}
              onChange={(checked) => updateSection('navigation', { transitions: checked })}
            />
          }
        />
      </SettingsGroup>
    </SettingsSection>
  );
}
