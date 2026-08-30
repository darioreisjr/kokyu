'use client';

import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { SettingsGroup } from '../SettingsGroup/SettingsGroup';
import { SettingsSection } from '../SettingsSection/SettingsSection';

/**
 * Settings → Integrações. Architecture only — no OAuth flow exists
 * yet, so "Conectar" stays disabled rather than pretending to start
 * one. Google Calendar is the only card because it's the only
 * integration with an obvious, near-term use in Ritmo Diário; nothing
 * else has a roadmap reason to be here yet.
 */
export function IntegrationSettings() {
  return (
    <SettingsSection
      title="Integrações"
      description="Conexões com outros serviços — hoje, só arquitetura."
    >
      <SettingsGroup>
        <Stack
          id="setting-integracoes-google-calendar"
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            paddingInline: 3,
            paddingBlock: 2.5,
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <CalendarMonthRoundedIcon
              aria-hidden="true"
              sx={(theme) => ({
                color: themePalette(theme).kokyu.text.secondary,
                marginTop: '2px',
              })}
            />
            <Stack spacing={0.25}>
              <Typography variant="labelLarge">Google Calendar</Typography>
              <Typography
                variant="body2"
                sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
              >
                Sincronize compromissos e sua rotina.
              </Typography>
              <Typography
                variant="labelSmall"
                sx={(theme) => ({ color: themePalette(theme).kokyu.text.disabled })}
              >
                Não conectado
              </Typography>
            </Stack>
          </Stack>
          <KokyuButton variant="outlined" size="small" disabled sx={{ flexShrink: 0 }}>
            Conectar
          </KokyuButton>
        </Stack>
      </SettingsGroup>
    </SettingsSection>
  );
}
