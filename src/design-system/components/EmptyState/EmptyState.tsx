import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import type { ComponentType, ReactNode } from 'react';

import { themePalette } from '../../theme/useThemePalette';

export interface EmptyStateProps {
  icon?: ComponentType<SvgIconProps>;
  title: string;
  description?: string;
  /** Typically a `KokyuButton` — the empty state's own CTA, if it has one. */
  action?: ReactNode;
}

/**
 * The one empty-state shape the app reuses everywhere a list/section
 * has nothing in it yet (Nutrição's Planejamento/Despensa/Compras/
 * Receitas, and any future feature) — icon, title, description, one
 * optional CTA, nothing more elaborate.
 */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Stack
      spacing={2}
      sx={{
        alignItems: 'center',
        textAlign: 'center',
        paddingBlock: 8,
        paddingInline: 3,
      }}
    >
      {Icon ? (
        <Icon
          aria-hidden="true"
          sx={(theme) => ({ fontSize: 48, color: themePalette(theme).kokyu.text.disabled })}
        />
      ) : null}
      <Stack spacing={0.5}>
        <Typography variant="labelLarge" component="p">
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
      {action}
    </Stack>
  );
}
