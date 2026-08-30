'use client';

import NextLink from 'next/link';

import { KokyuButton } from '@/design-system/components';
import { navigationItems } from '@/features/navigation/config/navigationItems';

import { usePreferences } from '../../providers/PreferencesProvider';
import { SettingsGroup } from '../SettingsGroup/SettingsGroup';
import { SettingsRow } from '../SettingsRow/SettingsRow';
import { SettingsSection } from '../SettingsSection/SettingsSection';
import { SettingsSelect } from '../SettingsSelect/SettingsSelect';
import { SettingsToggle } from '../SettingsToggle/SettingsToggle';

const homePageOptions = navigationItems.map((item) => ({ value: item.href, label: item.label }));

/** Settings → Geral: where the app opens and how much friction its actions have. */
export function GeneralSettings() {
  const { preferences, updateSection } = usePreferences();
  const { homePage, resumeLastPage, confirmImportantActions } = preferences.general;

  return (
    <SettingsSection
      title="Geral"
      description="Comportamentos básicos de como o Kokyu abre e reage às suas ações."
      autosaves
    >
      <SettingsGroup>
        <SettingsRow
          anchorId="setting-geral-pagina-inicial"
          title="Página inicial"
          description={
            resumeLastPage
              ? 'Ignorada enquanto "Continuar de onde parei" estiver ativo.'
              : 'Onde o Kokyu abre quando você entra.'
          }
          disabled={resumeLastPage}
          control={
            <SettingsSelect
              label="Página inicial"
              hideLabel
              value={homePage}
              options={homePageOptions}
              disabled={resumeLastPage}
              onChange={(value) => updateSection('general', { homePage: value })}
            />
          }
        />
        <SettingsRow
          anchorId="setting-geral-continuar"
          title="Continuar de onde parei"
          description="Abre na última página que você visitou, em vez da página inicial."
          control={
            <SettingsToggle
              label="Continuar de onde parei"
              checked={resumeLastPage}
              onChange={(checked) => updateSection('general', { resumeLastPage: checked })}
            />
          }
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow
          anchorId="setting-geral-confirmar-acoes"
          title="Confirmar ações importantes"
          description="Pede confirmação antes de ações que não podem ser desfeitas facilmente."
          control={
            <SettingsToggle
              label="Confirmar ações importantes"
              checked={confirmImportantActions}
              onChange={(checked) => updateSection('general', { confirmImportantActions: checked })}
            />
          }
        />
      </SettingsGroup>

      <SettingsGroup title="Módulos">
        <SettingsRow
          anchorId="setting-geral-treinamento"
          title="Treinamento"
          description="Unidade de peso, descanso padrão, anilhas disponíveis e outras preferências específicas de treino ficam dentro do próprio módulo."
          control={
            <KokyuButton
              variant="outlined"
              size="small"
              component={NextLink}
              href="/app/treinamento"
            >
              Abrir Treinamento
            </KokyuButton>
          }
        />
      </SettingsGroup>
    </SettingsSection>
  );
}
