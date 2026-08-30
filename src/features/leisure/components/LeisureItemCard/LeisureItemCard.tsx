'use client';

import StarRoundedIcon from '@mui/icons-material/StarRounded';
import TheaterComedyRoundedIcon from '@mui/icons-material/TheaterComedyRounded';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { cardTokens } from '@/design-system/tokens/component';

import { getLeisureItemTypeLabel } from '../../constants/leisureItemTypes';
import { leisureRoutes } from '../../constants/leisureRoutes';
import type { LeisureItem } from '../../types/leisureItem.types';
import { formatDuration } from '../../utils/durationFormat';
import { getEffectiveDuration } from '../../utils/suggestionEngine';
import { getLeisureItemProgress } from '../../utils/progress';
import { StatusChip } from '../StatusChip/StatusChip';

export interface LeisureItemCardProps {
  item: LeisureItem;
  /** Compact grid card (default) vs a wider row for list view. */
  layout?: 'grid' | 'list';
}

/** One card shape shared by Biblioteca/Lugares/Hobbies — capa, título, tipo, status, progresso, duração, favorito; never all at once, only what the item actually has. */
export function LeisureItemCard({ item, layout = 'grid' }: LeisureItemCardProps) {
  const progress = getLeisureItemProgress(item);
  const duration = getEffectiveDuration(item);

  return (
    <Box
      component={NextLink}
      href={leisureRoutes.item(item.id)}
      sx={(theme) => ({
        display: 'flex',
        flexDirection: layout === 'grid' ? 'column' : 'row',
        gap: layout === 'grid' ? 1.5 : 2,
        borderRadius: cardTokens.radius,
        border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        backgroundColor: themePalette(theme).kokyu.surface.primary,
        padding: 2,
        textDecoration: 'none',
        color: 'inherit',
      })}
    >
      <Box
        sx={(theme) => ({
          aspectRatio: layout === 'grid' ? '3 / 4' : undefined,
          width: layout === 'list' ? 64 : undefined,
          height: layout === 'list' ? 64 : undefined,
          flexShrink: 0,
          borderRadius: 1,
          backgroundColor: themePalette(theme).kokyu.background.subtle,
          backgroundImage: item.coverImage ? `url(${item.coverImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        {!item.coverImage ? (
          <TheaterComedyRoundedIcon
            aria-hidden="true"
            sx={(theme) => ({ fontSize: 32, color: themePalette(theme).kokyu.text.disabled })}
          />
        ) : null}
      </Box>

      <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Typography variant="labelLarge" component="p" noWrap>
            {item.title}
          </Typography>
          {item.favorite ? (
            <StarRoundedIcon
              aria-label="Favorito"
              fontSize="small"
              sx={(theme) => ({ color: themePalette(theme).kokyu.feedback.warning })}
            />
          ) : null}
        </Stack>
        <Typography
          variant="body2"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          {getLeisureItemTypeLabel(item.type)}
          {duration ? ` · ${formatDuration(duration)}` : ''}
        </Typography>
        <StatusChip type={item.type} status={item.status} />
        {progress ? (
          <Stack spacing={0.25}>
            <LinearProgress
              variant="determinate"
              value={progress.percent}
              sx={(theme) => ({
                borderRadius: 999,
                backgroundColor: themePalette(theme).kokyu.background.subtle,
              })}
            />
            <Typography
              variant="labelSmall"
              sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
            >
              {progress.current} / {progress.total} ({progress.percent}%)
            </Typography>
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}
