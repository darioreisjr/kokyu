'use client';

import NextLink from 'next/link';
import { useEffect, useState } from 'react';

import { KokyuButton } from '@/design-system/components';
import { profileService } from '@/features/profile/services/profileService';

import { SettingsDangerZone } from '../SettingsDangerZone/SettingsDangerZone';
import { SettingsGroup } from '../SettingsGroup/SettingsGroup';
import { SettingsRow } from '../SettingsRow/SettingsRow';
import { SettingsSection } from '../SettingsSection/SettingsSection';
import { DeleteAccountDialog } from './DeleteAccountDialog';

/** Settings → Conta. Identity fields live in Perfil, not here — this only links out to it. */
export function AccountSettings() {
  const [email, setEmail] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    profileService.getProfile().then((profile) => {
      if (!cancelled) setEmail(profile.email);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SettingsSection
      title="Conta"
      description="Sua identidade fica em Perfil — aqui só o essencial da conta."
    >
      <SettingsGroup>
        <SettingsRow
          anchorId="setting-conta-perfil"
          title="Perfil"
          description="Foto, nome, username e informações pessoais."
          control={
            <KokyuButton component={NextLink} href="/app/perfil" variant="outlined" size="small">
              Gerenciar perfil
            </KokyuButton>
          }
        />
        <SettingsRow
          anchorId="setting-conta-email"
          title="E-mail"
          description={email ?? 'Carregando…'}
          disabled={!email}
        />
      </SettingsGroup>

      <SettingsDangerZone description="Ações que não podem ser desfeitas.">
        <SettingsRow
          anchorId="setting-conta-excluir"
          title="Excluir conta"
          description="Remove permanentemente sua conta e seus dados."
          control={
            <KokyuButton
              variant="outlined"
              color="error"
              size="small"
              onClick={() => setDeleteOpen(true)}
            >
              Excluir minha conta
            </KokyuButton>
          }
        />
      </SettingsDangerZone>

      <DeleteAccountDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </SettingsSection>
  );
}
