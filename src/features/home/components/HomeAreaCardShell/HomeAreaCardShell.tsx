import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ComponentType, ReactNode } from 'react';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import { KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { HomeSectionCard } from '../HomeSectionCard/HomeSectionCard';

export interface HomeAreaCardShellProps {
  title: string;
  icon: ComponentType<SvgIconProps>;
  status: 'loading' | 'error' | 'success';
  isEmpty?: boolean;
  emptyMessage?: string;
  actionLabel: string;
  onOpen: () => void;
  children?: ReactNode;
}

/**
 * The shared shell every "Áreas de hoje" card builds on — compact,
 * always resolves to one of loading/error/empty/content (see spec's
 * "CARD DENSITY"/"ERROR ISOLATION"). A failed provider never blocks the
 * others: it just shows a quiet message here instead of the real data.
 */
export function HomeAreaCardShell({
  title,
  icon: Icon,
  status,
  isEmpty = false,
  emptyMessage,
  actionLabel,
  onOpen,
  children,
}: HomeAreaCardShellProps) {
  return (
    <HomeSectionCard compact muted={status !== 'success' || isEmpty}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Icon fontSize="small" sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })} />
          <Typography variant="labelLarge" component="h3">
            {title}
          </Typography>
        </Stack>

        {status === 'loading' ? (
          <Stack spacing={0.5}>
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="40%" />
          </Stack>
        ) : status === 'error' ? (
          <Typography variant="caption" sx={(theme) => ({ color: themePalette(theme).kokyu.text.disabled })}>
            Não foi possível carregar agora.
          </Typography>
        ) : isEmpty ? (
          <Typography variant="caption" sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}>
            {emptyMessage}
          </Typography>
        ) : (
          children
        )}

        <KokyuButton size="small" variant="text" sx={{ alignSelf: 'flex-start', mt: 0.5 }} onClick={onOpen}>
          {actionLabel}
        </KokyuButton>
      </Stack>
    </HomeSectionCard>
  );
}
