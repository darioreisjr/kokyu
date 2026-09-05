'use client';

import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import CenterFocusStrongRoundedIcon from '@mui/icons-material/CenterFocusStrongRounded';
import CoffeeRoundedIcon from '@mui/icons-material/CoffeeRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import MovieRoundedIcon from '@mui/icons-material/MovieRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import SelfImprovementRoundedIcon from '@mui/icons-material/SelfImprovementRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ComponentType } from 'react';
import { KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { createScheduleEntryActionProvider } from '@/features/daily-rhythm/adapters/actionProviders';
import { SCHEDULE_SOURCE_METAS } from '@/shared/scheduling/constants/schedulingConstants';
import type { FreeTimeSlot, ScheduleEntry, ScheduleSourceType } from '@/shared/scheduling/types';
import { formatDurationDisplay, timeToMinutes } from '@/shared/scheduling/utils/timeHelpers';
import { HomeSectionCard } from '../HomeSectionCard/HomeSectionCard';

const SOURCE_ICONS: Record<ScheduleSourceType, ComponentType<{ fontSize?: 'small' | 'inherit' | 'medium' | 'large' }>> = {
  mission: AssignmentRoundedIcon,
  habit: AutorenewRoundedIcon,
  training: FitnessCenterRoundedIcon,
  nutrition: RestaurantRoundedIcon,
  leisure: MovieRoundedIcon,
  goal: TrackChangesRoundedIcon,
  routine: SelfImprovementRoundedIcon,
  calendar: EventRoundedIcon,
  manual: ScheduleRoundedIcon,
  focus: CenterFocusStrongRoundedIcon,
  break: CoffeeRoundedIcon,
  travel: ScheduleRoundedIcon,
  blockedTime: ScheduleRoundedIcon,
};

export interface HomeNowCardProps {
  currentEntry: ScheduleEntry | null;
  freeSlot: FreeTimeSlot | null;
  now: Date;
  isLoading?: boolean;
  /** Overrides the primary action's label to "Continuar treino" when a session is already open — see spec's "Continuar treino"/"Iniciar treino". */
  trainingHasActiveSession?: boolean;
  onComplete: (entry: ScheduleEntry) => Promise<void>;
  onStartFocus: (entry: ScheduleEntry) => void;
  onNavigate: (href: string) => void;
  onOpenFreeTime: (slot: FreeTimeSlot) => void;
}

/**
 * "Agora" — the most important section of Respiração. Reuses the exact
 * per-source action mapping `ScheduleEntryCard` uses
 * (`createScheduleEntryActionProvider`) for the primary CTA's label
 * ("Iniciar treino", "Registrar conclusão", "Focar agora", ...) instead
 * of a second copy of that mapping.
 */
export function HomeNowCard({
  currentEntry,
  freeSlot,
  now,
  isLoading = false,
  trainingHasActiveSession = false,
  onComplete,
  onStartFocus,
  onNavigate,
  onOpenFreeTime,
}: HomeNowCardProps) {
  if (isLoading) {
    return (
      <HomeSectionCard>
        <Skeleton variant="text" width={80} height={28} />
        <Skeleton variant="text" width="60%" height={40} sx={{ mt: 1 }} />
        <Skeleton variant="rounded" width={140} height={36} sx={{ mt: 2 }} />
      </HomeSectionCard>
    );
  }

  if (!currentEntry) {
    const minutesFree = freeSlot ? freeSlot.duration : null;

    return (
      <HomeSectionCard>
        <Typography variant="h6" component="h2" sx={{ mb: 1.5 }}>
          Agora
        </Typography>
        <Typography variant="body1" sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}>
          {minutesFree
            ? `Nenhuma atividade planejada agora. Você tem ${formatDurationDisplay(minutesFree)} livres.`
            : 'Nenhuma atividade planejada agora.'}
        </Typography>
        {freeSlot ? (
          <KokyuButton
            size="medium"
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => onOpenFreeTime(freeSlot)}
          >
            Ver o que cabe aqui
          </KokyuButton>
        ) : null}
      </HomeSectionCard>
    );
  }

  const meta = SCHEDULE_SOURCE_METAS[currentEntry.sourceType] ?? SCHEDULE_SOURCE_METAS.manual;
  const Icon = SOURCE_ICONS[currentEntry.sourceType] ?? ScheduleRoundedIcon;

  const actionProvider = createScheduleEntryActionProvider({ onComplete, onStartFocus, onNavigate });
  const actions = actionProvider.getActionsForEntry(currentEntry);
  const primaryAction = actions[0];
  const primaryLabel =
    currentEntry.sourceType === 'training' && trainingHasActiveSession && primaryAction?.id === 'start-training'
      ? 'Continuar treino'
      : primaryAction?.label;

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const endMinutes = currentEntry.endAt ? timeToMinutes(currentEntry.endAt) : null;
  const remainingMinutes = endMinutes !== null ? Math.max(0, endMinutes - nowMinutes) : null;

  const timeRangeText = currentEntry.startAt
    ? `${currentEntry.startAt}${currentEntry.endAt ? ` - ${currentEntry.endAt}` : ''}`
    : 'Sem horário definido';

  return (
    <HomeSectionCard>
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        Agora
      </Typography>

      <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Box
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: '50%',
            flexShrink: 0,
            backgroundColor: themePalette(theme).kokyu.background.subtle,
            color: themePalette(theme).kokyu.text.primary,
          })}
        >
          <Icon fontSize="medium" />
        </Box>

        <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="caption" sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}>
            {meta.label}
          </Typography>
          <Typography variant="h5" component="p" sx={{ fontWeight: 700 }}>
            {currentEntry.title}
          </Typography>
          <Typography variant="body1" sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}>
            {timeRangeText}
            {remainingMinutes !== null ? ` • ${formatDurationDisplay(remainingMinutes)} restantes` : ''}
          </Typography>

          {primaryLabel ? (
            <KokyuButton
              size="medium"
              variant="contained"
              sx={{ mt: 1.5, alignSelf: 'flex-start' }}
              onClick={() => primaryAction!.perform(currentEntry)}
            >
              {primaryLabel}
            </KokyuButton>
          ) : null}
        </Stack>
      </Stack>
    </HomeSectionCard>
  );
}
