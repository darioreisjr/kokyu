'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { KokyuTextField } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { notificationCategoryGroups } from '../../constants/notificationCategories';
import { useNotificationPermission } from '../../hooks/useNotificationPermission';
import { usePreferences } from '../../providers/PreferencesProvider';
import { SettingsGroup } from '../SettingsGroup/SettingsGroup';
import { SettingsRow } from '../SettingsRow/SettingsRow';
import { SettingsSection } from '../SettingsSection/SettingsSection';
import { SettingsToggle } from '../SettingsToggle/SettingsToggle';

const PERMISSION_LABEL: Record<string, string> = {
  unsupported: 'Não suportado neste navegador',
  default: 'Ainda não solicitada',
  granted: 'Permitida',
  denied: 'Bloqueada nas configurações do navegador',
};

/** Settings → Notificações. */
export function NotificationSettings() {
  const { preferences, updateSection } = usePreferences();
  const { permission, requestPermission } = useNotificationPermission();
  const {
    enabled,
    inApp,
    push,
    email,
    categories,
    quietHoursEnabled,
    quietHoursStart,
    quietHoursEnd,
  } = preferences.notifications;

  const dependentDisabled = !enabled;

  async function handlePushToggle(checked: boolean) {
    if (checked && permission === 'default') {
      const result = await requestPermission();
      updateSection('notifications', { push: result === 'granted' });
      return;
    }
    updateSection('notifications', { push: checked });
  }

  function toggleCategory(id: string, checked: boolean) {
    updateSection('notifications', { categories: { ...categories, [id]: checked } });
  }

  return (
    <SettingsSection
      title="Notificações"
      description="Quais avisos o Kokyu pode te enviar, e por onde."
      autosaves
    >
      <SettingsGroup>
        <SettingsRow
          anchorId="setting-notificacoes-master"
          title="Notificações"
          description="Desativa todos os avisos do Kokyu de uma vez. Suas escolhas abaixo ficam guardadas."
          control={
            <SettingsToggle
              label="Notificações"
              checked={enabled}
              onChange={(checked) => updateSection('notifications', { enabled: checked })}
            />
          }
        />
      </SettingsGroup>

      <SettingsGroup title="Canais">
        <SettingsRow
          anchorId="setting-notificacoes-no-app"
          title="No aplicativo"
          disabled={dependentDisabled}
          control={
            <SettingsToggle
              label="Notificações no aplicativo"
              checked={inApp}
              disabled={dependentDisabled}
              onChange={(checked) => updateSection('notifications', { inApp: checked })}
            />
          }
        />
        <SettingsRow
          anchorId="setting-notificacoes-push"
          title="Push"
          description={`Depende da permissão do navegador — ${PERMISSION_LABEL[permission]}.`}
          disabled={dependentDisabled || permission === 'denied' || permission === 'unsupported'}
          control={
            <SettingsToggle
              label="Notificações push"
              checked={push && permission === 'granted'}
              disabled={
                dependentDisabled || permission === 'denied' || permission === 'unsupported'
              }
              onChange={(checked) => {
                void handlePushToggle(checked);
              }}
            />
          }
        />
        <SettingsRow
          anchorId="setting-notificacoes-email"
          title="E-mail"
          description="Ainda não há envio real de e-mail — esta preferência fica pronta para quando houver."
          disabled={dependentDisabled}
          control={
            <SettingsToggle
              label="Notificações por e-mail"
              checked={email}
              disabled={dependentDisabled}
              onChange={(checked) => updateSection('notifications', { email: checked })}
            />
          }
        />
      </SettingsGroup>

      {notificationCategoryGroups.map((group) => (
        <SettingsGroup key={group.group} title={group.group}>
          {group.categories.map((category) => (
            <SettingsRow
              key={category.id}
              title={category.label}
              disabled={dependentDisabled}
              control={
                <SettingsToggle
                  label={category.label}
                  checked={categories[category.id] ?? true}
                  disabled={dependentDisabled}
                  onChange={(checked) => toggleCategory(category.id, checked)}
                />
              }
            />
          ))}
        </SettingsGroup>
      ))}

      <SettingsGroup title="Horário silencioso">
        <SettingsRow
          anchorId="setting-notificacoes-horario-silencioso"
          title="Horário silencioso"
          description="Pausa avisos durante o período abaixo."
          disabled={dependentDisabled}
          control={
            <SettingsToggle
              label="Horário silencioso"
              checked={quietHoursEnabled}
              disabled={dependentDisabled}
              onChange={(checked) => updateSection('notifications', { quietHoursEnabled: checked })}
            />
          }
        />
        <SettingsRow
          title="Período"
          disabled={dependentDisabled || !quietHoursEnabled}
          control={
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <KokyuTextField
                type="time"
                label="De"
                value={quietHoursStart}
                disabled={dependentDisabled || !quietHoursEnabled}
                onChange={(event) =>
                  updateSection('notifications', { quietHoursStart: event.target.value })
                }
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ minWidth: { xs: '100%', sm: 140 } }}
              />
              <KokyuTextField
                type="time"
                label="Até"
                value={quietHoursEnd}
                disabled={dependentDisabled || !quietHoursEnabled}
                onChange={(event) =>
                  updateSection('notifications', { quietHoursEnd: event.target.value })
                }
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ minWidth: { xs: '100%', sm: 140 } }}
              />
            </Stack>
          }
        />
      </SettingsGroup>

      {permission === 'denied' ? (
        <Typography
          variant="body2"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          As notificações push estão bloqueadas nas configurações do seu navegador. O Kokyu não pode
          reativá-las por aqui.
        </Typography>
      ) : null}
    </SettingsSection>
  );
}
