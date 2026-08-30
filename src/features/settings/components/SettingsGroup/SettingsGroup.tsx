import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

import { cardTokens } from '@/design-system/tokens/component';
import { themePalette } from '@/design-system/theme/useThemePalette';

export interface SettingsGroupProps {
  /** Optional heading above the group — omit for a lone row that doesn't need one. */
  title?: string;
  children: ReactNode;
}

/**
 * A card clustering related `SettingsRow`s (e.g. every "Tema" control)
 * with a divider between each — the mid-level structure between a
 * whole `SettingsSection` and one row.
 */
export function SettingsGroup({ title, children }: SettingsGroupProps) {
  return (
    <Paper
      component="section"
      elevation={0}
      sx={(theme) => ({
        borderRadius: cardTokens.radius,
        border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        backgroundColor: themePalette(theme).kokyu.surface.primary,
        overflow: 'hidden',
      })}
    >
      {title ? (
        <Typography
          variant="labelMedium"
          component="h3"
          sx={(theme) => ({
            display: 'block',
            paddingInline: 3,
            paddingBlock: 2,
            color: themePalette(theme).kokyu.text.secondary,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            borderBottom: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
          })}
        >
          {title}
        </Typography>
      ) : null}
      <Stack divider={<Divider />}>{children}</Stack>
    </Paper>
  );
}
