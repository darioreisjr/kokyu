'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import type { ComponentType, ReactNode } from 'react';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { opacity } from '@/design-system/tokens/primitives/opacity';
import { spacing } from '@/design-system/tokens/primitives/spacing';

import type { Density } from '../../types/preferences.types';
import { usePreferences } from '../../providers/PreferencesProvider';

/** Settings → Aparência → "Densidade" — the one place that reads it for real, real padding change, not a CSS multiplier hack. */
const ROW_PADDING_BLOCK: Record<Density, string> = {
  compact: spacing[2],
  comfortable: spacing[3],
  spacious: spacing[5],
};

export interface SettingsRowProps {
  title: string;
  description?: string;
  control?: ReactNode;
  icon?: ComponentType<SvgIconProps>;
  disabled?: boolean;
  /** Applied to the title `Typography` — pair with a control's `aria-labelledby` when the control itself can't carry its own accessible name. */
  titleId?: string;
  /** DOM `id` for "Buscar configurações" to scroll/focus this row directly — omit for rows the search index doesn't list. */
  anchorId?: string;
}

/**
 * Title + description + control — the one shape almost every
 * preference in this feature takes. Stacks the control below on
 * mobile instead of squeezing it beside a wrapping title.
 */
export function SettingsRow({
  title,
  description,
  control,
  icon: Icon,
  disabled = false,
  titleId,
  anchorId,
}: SettingsRowProps) {
  const { preferences } = usePreferences();
  const paddingBlock = ROW_PADDING_BLOCK[preferences.appearance.density];

  return (
    <Stack
      id={anchorId}
      tabIndex={anchorId ? -1 : undefined}
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 1.5, sm: 2 }}
      sx={{
        paddingBlock,
        paddingInline: 3,
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        opacity: disabled ? opacity.disabled : 1,
        scrollMarginTop: 96,
        borderRadius: 1,
        '&:focus': {
          outline: (theme) => `2px solid ${themePalette(theme).kokyu.border.focus}`,
          outlineOffset: '-2px',
        },
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
        {Icon ? (
          <Icon
            aria-hidden="true"
            fontSize="small"
            sx={(theme) => ({
              color: themePalette(theme).kokyu.text.secondary,
              marginTop: '2px',
              flexShrink: 0,
            })}
          />
        ) : null}
        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
          <Typography id={titleId} variant="labelLarge" component="p">
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
      {control ? (
        <Box sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}>{control}</Box>
      ) : null}
    </Stack>
  );
}
