'use client';

import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { useMemo, useState } from 'react';

import { EmptyState } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { cardTokens } from '@/design-system/tokens/component';

import { getLeisureItemTypeLabel } from '../../constants/leisureItemTypes';
import { useHistory } from '../../hooks/useHistory';
import type { LeisureItem, LeisureItemType } from '../../types/leisureItem.types';
import { formatDuration } from '../../utils/durationFormat';
import { RatingInput } from '../RatingInput/RatingInput';

type FilterValue = 'todos' | 'favoritos' | LeisureItemType;

/** `/app/tempo-livre/historico` — the Logbook. One `LeisureLogEntry` per occurrence, never a copy of the source item, so a movie watched three times shows up as three entries here while the library keeps exactly one `LeisureItem`. */
export function HistoryPage() {
  const { status, logEntries, items } = useHistory();
  const [filter, setFilter] = useState<FilterValue>('todos');

  const itemsById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);

  const filterOptions = useMemo(() => {
    const types = Array.from(new Set(logEntries.map((entry) => entry.activityType)));
    return [
      { id: 'todos' as const, label: 'Todos' },
      { id: 'favoritos' as const, label: 'Favoritos' },
      ...types.map((type) => ({ id: type, label: getLeisureItemTypeLabel(type) })),
    ];
  }, [logEntries]);

  function isFavorite(itemId?: string): boolean {
    if (!itemId) return false;
    return Boolean(itemsById.get(itemId)?.favorite);
  }

  const filteredEntries = logEntries.filter((entry) => {
    if (filter === 'favoritos') return isFavorite(entry.leisureItemId);
    if (filter !== 'todos') return entry.activityType === filter;
    return true;
  });

  return (
    <Stack spacing={4}>
      <Stack spacing={0.5}>
        <Typography variant="displaySmall" component="h1">
          Histórico
        </Typography>
        <Typography
          variant="body1"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          Tudo que você já concluiu ou registrou aparece aqui.
        </Typography>
      </Stack>

      {logEntries.length > 0 ? (
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_event, next: FilterValue | null) => next && setFilter(next)}
          aria-label="Filtrar histórico"
          size="small"
          sx={{
            flexWrap: 'wrap',
            gap: 1,
            '& .MuiToggleButtonGroup-grouped': {
              border: '1px solid',
              borderRadius: '8px !important',
            },
          }}
        >
          {filterOptions.map((option) => (
            <ToggleButton key={option.id} value={option.id} sx={{ textTransform: 'none' }}>
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      ) : null}

      {status === 'loading' ? (
        <Stack spacing={1.5}>
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={72} />
          ))}
        </Stack>
      ) : null}
      {status === 'error' ? (
        <Alert severity="error">
          Não foi possível carregar seu histórico agora. Tente novamente.
        </Alert>
      ) : null}

      {status === 'ready' && logEntries.length === 0 ? (
        <EmptyState
          icon={HistoryRoundedIcon}
          title="As coisas que você concluir aparecerão aqui."
        />
      ) : null}

      {status === 'ready' && logEntries.length > 0 ? (
        <Stack spacing={1.5}>
          {filteredEntries.map((entry) => {
            const item = entry.leisureItemId ? itemsById.get(entry.leisureItemId) : undefined;
            return (
              <Paper
                key={entry.id}
                elevation={0}
                sx={(theme) => ({
                  borderRadius: cardTokens.radius,
                  border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
                  padding: 2,
                })}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
                >
                  <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="labelLarge" component="p">
                      {entry.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                    >
                      {getLeisureItemTypeLabel(entry.activityType)} ·{' '}
                      {format(new Date(entry.completedAt), "d 'de' MMMM 'de' yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                      {entry.duration ? ` · ${formatDuration(entry.duration)}` : ''}
                      {(item as LeisureItem | undefined)?.favorite ? ' · Favorito' : ''}
                    </Typography>
                    {entry.notes ? (
                      <Typography
                        variant="body2"
                        sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                      >
                        {entry.notes}
                      </Typography>
                    ) : null}
                  </Stack>
                  {entry.rating ? <RatingInput value={entry.rating} readOnly size="small" /> : null}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      ) : null}
    </Stack>
  );
}
