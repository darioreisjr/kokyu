'use client';

import { useState } from 'react';

import { KokyuButton } from '@/design-system/components';

import { SettingsGroup } from '../SettingsGroup/SettingsGroup';
import { SettingsRow } from '../SettingsRow/SettingsRow';
import { SettingsSection } from '../SettingsSection/SettingsSection';
import { ChangePasswordDialog } from './ChangePasswordDialog';

/**
 * Settings → Segurança. There is no backend behind any of this, so
 * nothing here fakes persistence: "Alterar senha" is the one flow
 * that's genuinely wired end-to-end (to a clearly-mocked service —
 * see `securityService.ts`), and 2FA/Passkeys stay disabled CTAs
 * rather than controls that would silently do nothing.
 */
export function SecuritySettings() {
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  return (
    <SettingsSection title="Segurança" description="Como sua conta é protegida.">
      <SettingsGroup title="Senha">
        <SettingsRow
          anchorId="setting-seguranca-senha"
          title="Senha"
          description="Altere a senha usada para entrar no Kokyu."
          control={
            <KokyuButton
              variant="outlined"
              size="small"
              onClick={() => setChangePasswordOpen(true)}
            >
              Alterar senha
            </KokyuButton>
          }
        />
      </SettingsGroup>

      <SettingsGroup title="Autenticação em duas etapas">
        <SettingsRow
          anchorId="setting-seguranca-2fa"
          title="Autenticação em duas etapas"
          description="Desativada. Chega em uma futura atualização do Kokyu."
          control={
            <KokyuButton variant="outlined" size="small" disabled>
              Configurar
            </KokyuButton>
          }
        />
      </SettingsGroup>

      <SettingsGroup title="Passkeys">
        <SettingsRow
          anchorId="setting-seguranca-passkeys"
          title="Passkeys"
          description="Preparado para uma futura integração com WebAuthn — nenhuma credencial é armazenada hoje."
          control={
            <KokyuButton variant="outlined" size="small" disabled>
              Gerenciar passkeys
            </KokyuButton>
          }
        />
      </SettingsGroup>

      <ChangePasswordDialog
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </SettingsSection>
  );
}
