'use client';

import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';

import { KokyuButton, KokyuTextField } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { contextTagDefinitions } from '../../constants/contextTags';
import { durationShortcuts } from '../../constants/durationShortcuts';
import { moodDefinitions } from '../../constants/moods';
import type { LeisureItem } from '../../types/leisureItem.types';
import type { LeisureMoodId } from '../../types/suggestion.types';
import { formatDuration } from '../../utils/durationFormat';
import { getSuggestionsForAvailableTime } from '../../utils/suggestionEngine';
import { LeisureItemCard } from '../LeisureItemCard/LeisureItemCard';

export interface TimeAvailabilitySuggesterProps {
  items: LeisureItem[];
  onStart: (item: LeisureItem) => void;
}

/**
 * "O que cabe agora?" — Kokyu's flagship Tempo Livre feature. Every
 * filter here (duration/mood/context) feeds the one shared
 * `getSuggestionsForAvailableTime` engine; nothing is re-derived here.
 */
export function TimeAvailabilitySuggester({ items, onStart }: TimeAvailabilitySuggesterProps) {
  const [shortcutId, setShortcutId] = useState<string | null>(null);
  const [customMinutes, setCustomMinutes] = useState<number | ''>('');
  const [mood, setMood] = useState<LeisureMoodId | null>(null);
  const [contextTag, setContextTag] = useState<string | null>(null);

  const selectedShortcut = durationShortcuts.find((shortcut) => shortcut.id === shortcutId);
  const durationMinutes =
    selectedShortcut?.minutes ??
    (shortcutId === 'personalizado' && customMinutes !== '' ? customMinutes : null);

  const suggestions = useMemo(() => {
    if (!durationMinutes || durationMinutes <= 0) return [];
    return getSuggestionsForAvailableTime(items, {
      durationMinutes,
      mood: mood ?? undefined,
      contextTag: contextTag ?? undefined,
    });
  }, [items, durationMinutes, mood, contextTag]);

  return (
    <Stack spacing={2.5}>
      <Stack spacing={1}>
        <Typography variant="labelMedium">Quanto tempo você tem?</Typography>
        <ToggleButtonGroup
          value={shortcutId}
          exclusive
          onChange={(_event, next: string | null) => setShortcutId(next)}
          aria-label="Tempo disponível"
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
          {durationShortcuts.map((shortcut) => (
            <ToggleButton key={shortcut.id} value={shortcut.id} sx={{ textTransform: 'none' }}>
              {shortcut.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        {shortcutId === 'personalizado' ? (
          <KokyuTextField
            label="Minutos disponíveis"
            type="number"
            slotProps={{ htmlInput: { min: 1 } }}
            value={customMinutes}
            onChange={(event) =>
              setCustomMinutes(event.target.value === '' ? '' : Number(event.target.value))
            }
            sx={{ maxWidth: 220 }}
          />
        ) : null}
      </Stack>

      <Stack spacing={1}>
        <Typography variant="labelMedium">Estou com vontade de...</Typography>
        <ToggleButtonGroup
          value={mood}
          exclusive
          onChange={(_event, next: LeisureMoodId | null) => setMood(next)}
          aria-label="Humor"
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
          {moodDefinitions.map((option) => (
            <ToggleButton key={option.id} value={option.id} sx={{ textTransform: 'none' }}>
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      <Stack spacing={1}>
        <Typography variant="labelMedium">Contexto (opcional)</Typography>
        <ToggleButtonGroup
          value={contextTag}
          exclusive
          onChange={(_event, next: string | null) => setContextTag(next)}
          aria-label="Contexto"
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
          {contextTagDefinitions.map((tag) => (
            <ToggleButton key={tag.id} value={tag.id} sx={{ textTransform: 'none' }}>
              {tag.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      {durationMinutes ? (
        suggestions.length > 0 ? (
          <Stack spacing={1.5}>
            <Typography
              variant="body2"
              sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
            >
              Cabe em {formatDuration(durationMinutes)}:
            </Typography>
            {suggestions.map(({ item }) => (
              <Stack key={item.id} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Stack sx={{ flex: 1, minWidth: 0 }}>
                  <LeisureItemCard item={item} layout="list" />
                </Stack>
                <KokyuButton variant="outlined" size="small" onClick={() => onStart(item)}>
                  Começar
                </KokyuButton>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Typography
            variant="body2"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Nada salvo cabe nesse tempo agora.
          </Typography>
        )
      ) : null}
    </Stack>
  );
}
