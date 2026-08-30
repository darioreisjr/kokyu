'use client';

import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

import { KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { detectDeviceLabel } from '../../utils/deviceInfo';
import { SettingsGroup } from '../SettingsGroup/SettingsGroup';
import { SettingsRow } from '../SettingsRow/SettingsRow';
import { SettingsSection } from '../SettingsSection/SettingsSection';

/**
 * Settings → Sessões e dispositivos. There's no backend tracking real
 * sessions, so this shows only what's genuinely knowable from this
 * one browser (no invented location, no other devices) and treats
 * "Sair de todos os dispositivos" as backend-dependent rather than
 * faking a remote sign-out that wouldn't do anything.
 */
export function SessionsSettings() {
  const [deviceLabel, setDeviceLabel] = useState('Este dispositivo');
  useEffect(() => {
    queueMicrotask(() => setDeviceLabel(detectDeviceLabel(navigator.userAgent)));
  }, []);

  return (
    <SettingsSection
      title="Sessões e dispositivos"
      description="Onde sua conta está conectada. Hoje só sabemos sobre esta sessão."
    >
      <SettingsGroup title="Sessão atual">
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', paddingInline: 3, paddingBlock: 2.5 }}
        >
          <DevicesRoundedIcon
            aria-hidden="true"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          />
          <Stack spacing={0.25}>
            <Typography variant="labelLarge">{deviceLabel}</Typography>
            <Typography
              variant="body2"
              sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
            >
              Sessão atual · Ativa agora
            </Typography>
          </Stack>
        </Stack>
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow
          anchorId="setting-sessoes-sair-todos"
          title="Sair de todos os dispositivos"
          description="Depende de um backend que ainda não existe — por enquanto, indisponível."
          disabled
          control={
            <KokyuButton variant="outlined" color="error" size="small" disabled>
              Sair de todos os dispositivos
            </KokyuButton>
          }
        />
      </SettingsGroup>
    </SettingsSection>
  );
}
