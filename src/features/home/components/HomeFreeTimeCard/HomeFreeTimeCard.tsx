'use client';

import { useEffect, useState } from 'react';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import type { FreeTimeSlot, ScheduleCandidate } from '@/shared/scheduling/types';
import { formatDurationDisplay } from '@/shared/scheduling/utils/timeHelpers';
import type { HomeSuggestion } from '@/shared/home/types';
import { getHomeSuggestions } from '../../services/homeSuggestionService';
import { HomeSectionCard } from '../HomeSectionCard/HomeSectionCard';

export interface HomeFreeTimeCardProps {
  freeSlot: FreeTimeSlot | null;
  onSelectCandidate: (candidate: ScheduleCandidate, slot: FreeTimeSlot) => Promise<void>;
  onOpenFullList: (slot: FreeTimeSlot) => void;
}

const INLINE_SUGGESTION_LIMIT = 3;

/**
 * "Tempo livre / possibilidades" — a lightweight preview of what fits
 * right now, via `getHomeSuggestions` (a thin ranking wrapper over the
 * existing `getCandidatesForAvailableTime`, never a second matching
 * algorithm). Fully hidden when there's no current free block — an
 * adaptive section, not an empty card (see spec's "ADAPTIVE HOME").
 */
export function HomeFreeTimeCard({ freeSlot, onSelectCandidate, onOpenFullList }: HomeFreeTimeCardProps) {
  const [suggestions, setSuggestions] = useState<HomeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!freeSlot) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    getHomeSuggestions(freeSlot.duration, freeSlot.date)
      .then(setSuggestions)
      .finally(() => setIsLoading(false));
  }, [freeSlot?.date, freeSlot?.duration]);

  if (!freeSlot) return null;

  return (
    <HomeSectionCard>
      <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
        Tempo livre
      </Typography>
      <Typography variant="body1" sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary, mb: 1.5 })}>
        Você tem {formatDurationDisplay(freeSlot.duration)} livres agora.
      </Typography>

      {isLoading ? (
        <Stack direction="row" spacing={1}>
          <Skeleton variant="rounded" width={100} height={32} />
          <Skeleton variant="rounded" width={100} height={32} />
        </Stack>
      ) : suggestions.length === 0 ? (
        <Typography variant="caption" sx={(theme) => ({ color: themePalette(theme).kokyu.text.disabled })}>
          Nenhuma sugestão compatível encontrada.
        </Typography>
      ) : (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {suggestions.slice(0, INLINE_SUGGESTION_LIMIT).map(({ candidate }) => (
            <Chip
              key={candidate.id}
              label={candidate.title}
              variant="outlined"
              clickable
              onClick={() => onSelectCandidate(candidate, freeSlot)}
            />
          ))}
        </Stack>
      )}

      <KokyuButton size="small" variant="text" sx={{ mt: 1.5 }} onClick={() => onOpenFullList(freeSlot)}>
        Ver o que cabe aqui
      </KokyuButton>
    </HomeSectionCard>
  );
}
