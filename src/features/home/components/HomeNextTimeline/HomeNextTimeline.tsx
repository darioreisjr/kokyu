import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ScheduleEntryCard } from '@/features/daily-rhythm/components/ScheduleEntryCard/ScheduleEntryCard';
import { KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import type { ScheduleEntry } from '@/shared/scheduling/types';
import { HomeSectionCard } from '../HomeSectionCard/HomeSectionCard';

export interface HomeNextTimelineProps {
  entries: ScheduleEntry[];
  isLoading?: boolean;
  onNavigateToRhythm: () => void;
}

const MAX_VISIBLE = 4;

/**
 * "Próximo" — a compact mini-timeline, not the full day. Reuses
 * `ScheduleEntryCard` (compact) from `daily-rhythm` instead of a second
 * entry-row component; "Ver dia completo" is the only way deeper.
 */
export function HomeNextTimeline({ entries, isLoading = false, onNavigateToRhythm }: HomeNextTimelineProps) {
  return (
    <HomeSectionCard>
      <Typography variant="h6" component="h2" sx={{ mb: 1.5 }}>
        Próximo
      </Typography>

      {isLoading ? (
        <Stack spacing={1}>
          <Skeleton variant="rounded" height={56} />
          <Skeleton variant="rounded" height={56} />
        </Stack>
      ) : entries.length === 0 ? (
        <Typography variant="body1" sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}>
          Nada mais planejado por enquanto.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {entries.slice(0, MAX_VISIBLE).map((entry) => (
            <ScheduleEntryCard key={entry.id} entry={entry} compact />
          ))}
        </Stack>
      )}

      <KokyuButton size="small" variant="text" sx={{ mt: 1.5 }} onClick={onNavigateToRhythm}>
        Ver dia completo
      </KokyuButton>
    </HomeSectionCard>
  );
}
