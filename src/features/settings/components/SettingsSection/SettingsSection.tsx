import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

import { themePalette } from '@/design-system/theme/useThemePalette';

export interface SettingsSectionProps {
  title: string;
  description?: string;
  /** Shows a small, permanent "Alterações salvas automaticamente" note — the subtle, non-Snackbar feedback every auto-saving section uses instead of a toast per toggle. */
  autosaves?: boolean;
  children: ReactNode;
}

/** One full category's content (Geral, Aparência, ...) — heading, description, and its `SettingsGroup`s. */
export function SettingsSection({
  title,
  description,
  autosaves = false,
  children,
}: SettingsSectionProps) {
  const headingId = `settings-section-${slugify(title)}`;

  return (
    <Stack spacing={4} component="section" aria-labelledby={headingId}>
      <Stack spacing={0.5}>
        <Typography id={headingId} variant="h3" component="h2">
          {title}
        </Typography>
        {description ? (
          <Typography
            variant="body1"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            {description}
          </Typography>
        ) : null}
        {autosaves ? (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', marginTop: 0.5 }}>
            <CheckRoundedIcon
              aria-hidden="true"
              fontSize="inherit"
              sx={(theme) => ({ color: themePalette(theme).kokyu.feedback.success })}
            />
            <Typography
              variant="labelSmall"
              sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
            >
              Alterações salvas automaticamente
            </Typography>
          </Stack>
        ) : null}
      </Stack>
      <Stack spacing={4}>{children}</Stack>
    </Stack>
  );
}

/** ASCII-only id fragment for a pt-BR title — strips accents rather than percent-encoding them. */
function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
