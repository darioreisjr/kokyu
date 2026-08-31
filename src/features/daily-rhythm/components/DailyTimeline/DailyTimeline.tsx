'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { isToday as isTodayFns } from 'date-fns';
import { fromDateKey } from '@/features/leisure/utils/dateHelpers';
import { usePreferences } from '@/features/settings/providers/PreferencesProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';
import type { FreeTimeSlot, ScheduleEntry } from '@/shared/scheduling/types';
import { timeToMinutes } from '@/shared/scheduling/utils/timeHelpers';
import { FreeTimeSlotCard } from '../FreeTimeSlotCard/FreeTimeSlotCard';
import { NowIndicator } from '../NowIndicator/NowIndicator';
import { ScheduleEntryCard } from '../ScheduleEntryCard/ScheduleEntryCard';

export interface DailyTimelineProps {
  date: string;
  entries: ScheduleEntry[];
  freeSlots: FreeTimeSlot[];
  onCompleteEntry?: (entry: ScheduleEntry) => Promise<void>;
  onStartFocus?: (entry: ScheduleEntry) => void;
  onRescheduleEntry?: (entry: ScheduleEntry) => void;
  onEditEntry?: (entry: ScheduleEntry) => void;
  onDeleteEntry?: (entry: ScheduleEntry) => Promise<void>;
  onNavigate?: (href: string) => void;
  onFillSlot?: (slot: FreeTimeSlot) => void;
}

export function DailyTimeline({
  date,
  entries,
  freeSlots,
  onCompleteEntry,
  onStartFocus,
  onRescheduleEntry,
  onEditEntry,
  onDeleteEntry,
  onNavigate,
  onFillSlot,
}: DailyTimelineProps) {
  const { preferences } = usePreferences();
  const dayStartsAt = preferences.routine.dayStartsAt || '06:00';

  const isToday = isTodayFns(fromDateKey(date));

  const allDayEntries = entries.filter((e) => e.allDay);
  const timedEntries = entries.filter((e) => !e.allDay && e.startAt);

  type StreamItem =
    | { type: 'entry'; data: ScheduleEntry; startMin: number }
    | { type: 'free'; data: FreeTimeSlot; startMin: number };

  const streamItems: StreamItem[] = [
    ...timedEntries.map((e) => ({
      type: 'entry' as const,
      data: e,
      startMin: timeToMinutes(e.startAt!),
    })),
    ...freeSlots.map((s) => ({
      type: 'free' as const,
      data: s,
      startMin: timeToMinutes(s.startAt),
    })),
  ].sort((a, b) => a.startMin - b.startMin);

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      {/* All Day section */}
      {allDayEntries.length > 0 && (
        <Box
          sx={(theme) => ({
            mb: 2,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: themePalette(theme).kokyu.surface.primary,
            border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
          })}
        >
          <Typography
            variant="caption"
            sx={(theme) => ({
              color: themePalette(theme).kokyu.text.secondary,
              fontWeight: 700,
              mb: 1,
              display: 'block',
            })}
          >
            Dia todo
          </Typography>

          <Stack spacing={1}>
            {allDayEntries.map((entry) => (
              <ScheduleEntryCard
                key={entry.id}
                entry={entry}
                onComplete={onCompleteEntry}
                onStartFocus={onStartFocus}
                onReschedule={onRescheduleEntry}
                onEdit={onEditEntry}
                onDelete={onDeleteEntry}
                onNavigate={onNavigate}
                compact
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Main Chronological Timeline Stream */}
      <Box
        sx={(theme) => ({
          position: 'relative',
          borderRadius: 2,
          p: { xs: 1.5, md: 2.5 },
          backgroundColor: themePalette(theme).kokyu.surface.primary,
          border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
          minHeight: 400,
        })}
      >
        {isToday && (
          <Box sx={{ position: 'relative', width: '100%', height: 0, mb: 1 }}>
            <NowIndicator dayStartMinutes={timeToMinutes(dayStartsAt)} />
          </Box>
        )}

        {streamItems.length === 0 ? (
          <Stack sx={{ alignItems: 'center', justifyContent: 'center', py: 8, textAlign: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              Nenhum evento agendado para este dia
            </Typography>
            <Typography
              variant="caption"
              sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
            >
              Use &quot;Planejar meu dia&quot; para organizar atividades ou adicione um compromisso manual.
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={1.5} sx={{ position: 'relative', zIndex: 1 }}>
            {streamItems.map((item) =>
              item.type === 'entry' ? (
                <ScheduleEntryCard
                  key={item.data.id}
                  entry={item.data}
                  onComplete={onCompleteEntry}
                  onStartFocus={onStartFocus}
                  onReschedule={onRescheduleEntry}
                  onEdit={onEditEntry}
                  onDelete={onDeleteEntry}
                  onNavigate={onNavigate}
                />
              ) : (
                <FreeTimeSlotCard
                  key={item.data.id}
                  slot={item.data}
                  onFillSlot={(slot) => onFillSlot?.(slot)}
                />
              ),
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

