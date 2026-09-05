import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { CapacityIndicator } from '@/features/daily-rhythm/components/CapacityIndicator/CapacityIndicator';
import type { DailyCapacity } from '@/shared/scheduling/types';
import { formatDurationDisplay } from '@/shared/scheduling/utils/timeHelpers';
import { HomeSectionCard } from '../HomeSectionCard/HomeSectionCard';

export interface HomeCapacityProps {
  capacity: DailyCapacity | null;
  now: Date;
  hasAnyEntry: boolean;
  showCapacity: boolean;
  isLoading?: boolean;
  onOpenPlanning: () => void;
}

function toHHmm(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/**
 * "Ritmo do dia" — position in the day + capacity, reusing
 * `CapacityIndicator` (compact) from `daily-rhythm` rather than a second
 * bar. Never rendered with an empty capacity card (see spec's "NÃO
 * EXIBIR CAPACITY SE NÃO HOUVER DADOS") — an unplanned day gets "Planejar
 * meu dia" instead.
 */
export function HomeCapacity({
  capacity,
  now,
  hasAnyEntry,
  showCapacity,
  isLoading = false,
  onOpenPlanning,
}: HomeCapacityProps) {
  return (
    <HomeSectionCard>
      <Typography variant="h6" component="h2" sx={{ mb: 1.5 }}>
        Ritmo do dia
      </Typography>

      <Typography variant="body1" sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary, mb: 1.5 })}>
        Agora {toHHmm(now)}
      </Typography>

      {isLoading ? (
        <Skeleton variant="rounded" height={64} />
      ) : !hasAnyEntry ? (
        <Stack spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <Typography variant="body1" sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}>
            Seu dia ainda não foi planejado.
          </Typography>
          <KokyuButton size="small" variant="outlined" onClick={onOpenPlanning}>
            Planejar meu dia
          </KokyuButton>
        </Stack>
      ) : showCapacity && capacity ? (
        <Stack spacing={1.5}>
          <CapacityIndicator capacity={capacity} compact />
          {capacity.status === 'overcapacity' ? (
            <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
              <Typography
                variant="caption"
                sx={(theme) => ({ color: themePalette(theme).kokyu.feedback.error, fontWeight: 600 })}
              >
                Seu planejamento está {formatDurationDisplay(capacity.differenceMinutes)} acima do tempo
                disponível.
              </Typography>
              <KokyuButton size="small" variant="outlined" onClick={onOpenPlanning}>
                Reorganizar dia
              </KokyuButton>
            </Stack>
          ) : null}
        </Stack>
      ) : null}
    </HomeSectionCard>
  );
}
