import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

import { cardTokens } from '@/design-system/tokens/component';
import { themePalette } from '@/design-system/theme/useThemePalette';

export interface SettingsDangerZoneProps {
  title?: string;
  description?: string;
  /** Each irreversible action — typically one or more `SettingsRow`s with an error-colored `Button` control. */
  children: ReactNode;
}

/**
 * The visually-distinct closing subsection of "Conta" for irreversible
 * actions. Marked by border, icon and heading together — never by
 * color alone, so it still reads correctly without color vision.
 */
export function SettingsDangerZone({
  title = 'Zona de perigo',
  description,
  children,
}: SettingsDangerZoneProps) {
  return (
    <Paper
      component="section"
      aria-label={title}
      elevation={0}
      sx={(theme) => ({
        borderRadius: cardTokens.radius,
        border: `1px solid ${themePalette(theme).kokyu.feedback.error}`,
        backgroundColor: themePalette(theme).kokyu.surface.primary,
        overflow: 'hidden',
      })}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={(theme) => ({
          paddingInline: 3,
          paddingBlock: 2,
          alignItems: 'flex-start',
          borderBottom: `1px solid ${themePalette(theme).kokyu.feedback.error}`,
        })}
      >
        <WarningAmberRoundedIcon
          aria-hidden="true"
          fontSize="small"
          sx={(theme) => ({ color: themePalette(theme).kokyu.feedback.error, marginTop: '2px' })}
        />
        <Stack spacing={0.25}>
          <Typography
            variant="labelLarge"
            component="h3"
            sx={(theme) => ({ color: themePalette(theme).kokyu.feedback.error })}
          >
            {title}
          </Typography>
          {description ? (
            <Typography
              variant="body2"
              sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
            >
              {description}
            </Typography>
          ) : null}
        </Stack>
      </Stack>
      <Stack>{children}</Stack>
    </Paper>
  );
}
