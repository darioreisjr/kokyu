'use client';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { addDays, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from 'date-fns';
import type { MouseEvent } from 'react';
import { useMemo, useState } from 'react';

import { KokyuButton, KokyuDateField, EmptyState } from '@/design-system/components';
import { usePreferences } from '@/features/settings/providers/PreferencesProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { cardTokens } from '@/design-system/tokens/component';

import {
  scheduleStatusChipColor,
  scheduleStatusLabels,
} from '../../constants/scheduleStatusLabels';
import { usePrograms } from '../../hooks/usePrograms';
import { useScheduleEntries } from '../../hooks/useScheduleEntries';
import { trainingScheduleService } from '../../services/trainingScheduleService';
import type { TrainingScheduleEntry } from '../../types';
import { fromDateKey, toDateKey } from '../../utils/dateHelpers';
import { ScheduleWorkoutDialog } from '../ScheduleWorkoutDialog/ScheduleWorkoutDialog';

type CalendarView = 'week' | 'month';

function EntryChip({
  entry,
  isDeloadWeek,
  onClick,
}: {
  entry: TrainingScheduleEntry;
  isDeloadWeek: boolean;
  onClick: (event: MouseEvent<HTMLElement>) => void;
}) {
  return (
    <Chip
      size="small"
      label={`${entry.time ? `${entry.time} · ` : ''}${entry.label}${isDeloadWeek ? ' · Redução' : ''}`}
      color={scheduleStatusChipColor[entry.status]}
      onClick={onClick}
      sx={{ maxWidth: '100%', justifyContent: 'flex-start' }}
    />
  );
}

export function TrainingCalendarPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { preferences } = usePreferences();
  const weekStartsOn = preferences.locale.weekStartsOn;

  const [referenceDate, setReferenceDate] = useState(() => new Date());
  const [view, setView] = useState<CalendarView>('week');
  const [scheduleDialog, setScheduleDialog] = useState<{ open: boolean; date?: Date }>({
    open: false,
  });
  const [rescheduleTarget, setRescheduleTarget] = useState<TrainingScheduleEntry | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{
    el: HTMLElement;
    entry: TrainingScheduleEntry;
  } | null>(null);

  const range = useMemo(() => {
    if (isMobile)
      return { from: toDateKey(referenceDate), to: toDateKey(addDays(referenceDate, 13)) };
    if (view === 'week') {
      const start = startOfWeek(referenceDate, { weekStartsOn });
      return { from: toDateKey(start), to: toDateKey(addDays(start, 6)) };
    }
    const gridStart = startOfWeek(startOfMonth(referenceDate), { weekStartsOn });
    const gridEnd = endOfWeek(endOfMonth(referenceDate), { weekStartsOn });
    return { from: toDateKey(gridStart), to: toDateKey(gridEnd) };
  }, [isMobile, view, referenceDate, weekStartsOn]);

  const { entries, reload } = useScheduleEntries(range);
  const { programs } = usePrograms();

  const entriesByDate = useMemo(() => {
    const map = new Map<string, TrainingScheduleEntry[]>();
    for (const entry of entries) {
      const list = map.get(entry.date) ?? [];
      list.push(entry);
      map.set(entry.date, list);
    }
    return map;
  }, [entries]);

  const deloadWeekIds = useMemo(() => {
    const ids = new Set<string>();
    for (const program of programs) {
      for (const block of program.blocks) {
        for (const week of block.weeks) {
          if (week.isDeload) ids.add(week.id);
        }
      }
    }
    return ids;
  }, [programs]);

  function isDeload(entry: TrainingScheduleEntry): boolean {
    return Boolean(entry.programWeekId && deloadWeekIds.has(entry.programWeekId));
  }

  function closeMenu() {
    setMenuAnchor(null);
  }

  async function handleSkip() {
    if (!menuAnchor) return;
    await trainingScheduleService.skipScheduledWorkout(menuAnchor.entry.id);
    reload();
    closeMenu();
  }

  function handleStartReschedule() {
    if (!menuAnchor) return;
    setRescheduleTarget(menuAnchor.entry);
    setRescheduleDate(fromDateKey(menuAnchor.entry.date));
    closeMenu();
  }

  async function confirmReschedule() {
    if (!rescheduleTarget || !rescheduleDate) return;
    await trainingScheduleService.rescheduleWorkout(rescheduleTarget.id, toDateKey(rescheduleDate));
    setRescheduleTarget(null);
    reload();
  }

  const daysInView = useMemo(() => {
    const days: Date[] = [];
    let cursor = fromDateKey(range.from);
    const end = fromDateKey(range.to);
    while (cursor <= end) {
      days.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return days;
  }, [range]);

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' } }}
      >
        <Stack spacing={0.5}>
          <Typography variant="displaySmall" component="h1">
            Calendário
          </Typography>
          <Typography
            variant="body1"
            sx={(innerTheme) => ({ color: themePalette(innerTheme).kokyu.text.secondary })}
          >
            Treinos planejados, concluídos e dias de descanso.
          </Typography>
        </Stack>
        <KokyuButton
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => setScheduleDialog({ open: true })}
        >
          Planejar treino
        </KokyuButton>
      </Stack>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 1 }}
      >
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <IconButton
            size="small"
            aria-label="Período anterior"
            onClick={() =>
              setReferenceDate((current) => addDays(current, view === 'month' ? -30 : -7))
            }
          >
            <ChevronLeftRoundedIcon />
          </IconButton>
          <KokyuButton size="small" variant="text" onClick={() => setReferenceDate(new Date())}>
            Hoje
          </KokyuButton>
          <IconButton
            size="small"
            aria-label="Próximo período"
            onClick={() =>
              setReferenceDate((current) => addDays(current, view === 'month' ? 30 : 7))
            }
          >
            <ChevronRightRoundedIcon />
          </IconButton>
        </Stack>
        {!isMobile ? (
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_event, next: CalendarView | null) => next && setView(next)}
            size="small"
            aria-label="Visualização do calendário"
          >
            <ToggleButton value="week">Semana</ToggleButton>
            <ToggleButton value="month">Mês</ToggleButton>
          </ToggleButtonGroup>
        ) : null}
      </Stack>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 0.5 }} aria-hidden="true">
        {(Object.keys(scheduleStatusLabels) as (keyof typeof scheduleStatusLabels)[])
          .filter((key) => key !== 'rescheduled')
          .map((key) => (
            <Chip
              key={key}
              size="small"
              label={scheduleStatusLabels[key]}
              color={scheduleStatusChipColor[key]}
              variant="outlined"
            />
          ))}
      </Stack>

      {isMobile ? (
        <Stack spacing={1.5}>
          {daysInView.map((day) => {
            const dayKey = toDateKey(day);
            const dayEntries = entriesByDate.get(dayKey) ?? [];
            return (
              <Stack
                key={dayKey}
                spacing={1}
                sx={(innerTheme) => ({
                  borderRadius: cardTokens.radius,
                  border: `1px solid ${themePalette(innerTheme).kokyu.border.subtle}`,
                  padding: 1.5,
                })}
              >
                <Typography variant="labelMedium">
                  {day.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </Typography>
                {dayEntries.length === 0 ? (
                  <Typography
                    variant="body2"
                    sx={(innerTheme) => ({ color: themePalette(innerTheme).kokyu.text.secondary })}
                  >
                    Nada planejado
                  </Typography>
                ) : (
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                    {dayEntries.map((entry) => (
                      <EntryChip
                        key={entry.id}
                        entry={entry}
                        isDeloadWeek={isDeload(entry)}
                        onClick={(event) => setMenuAnchor({ el: event.currentTarget, entry })}
                      />
                    ))}
                  </Stack>
                )}
              </Stack>
            );
          })}
        </Stack>
      ) : view === 'week' ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 1.5 }}>
          {daysInView.map((day) => {
            const dayKey = toDateKey(day);
            const dayEntries = entriesByDate.get(dayKey) ?? [];
            const isToday = dayKey === toDateKey(new Date());
            return (
              <Stack
                key={dayKey}
                spacing={1}
                sx={(innerTheme) => ({
                  borderRadius: cardTokens.radius,
                  border: `1px solid ${isToday ? themePalette(innerTheme).kokyu.action.primary : themePalette(innerTheme).kokyu.border.subtle}`,
                  padding: 1.5,
                  minHeight: 140,
                })}
              >
                <Typography variant="labelSmall">
                  {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </Typography>
                <Typography variant="labelMedium">{day.getDate()}</Typography>
                <Stack spacing={0.5}>
                  {dayEntries.map((entry) => (
                    <EntryChip
                      key={entry.id}
                      entry={entry}
                      isDeloadWeek={isDeload(entry)}
                      onClick={(event) => setMenuAnchor({ el: event.currentTarget, entry })}
                    />
                  ))}
                </Stack>
                <IconButton
                  size="small"
                  aria-label={`Planejar treino em ${dayKey}`}
                  onClick={() => setScheduleDialog({ open: true, date: day })}
                >
                  <AddRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
            );
          })}
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 1 }}>
          {daysInView.map((day) => {
            const dayKey = toDateKey(day);
            const dayEntries = entriesByDate.get(dayKey) ?? [];
            const isCurrentMonth = day.getMonth() === referenceDate.getMonth();
            return (
              <Stack
                key={dayKey}
                spacing={0.5}
                sx={(innerTheme) => ({
                  borderRadius: cardTokens.radius,
                  border: `1px solid ${themePalette(innerTheme).kokyu.border.subtle}`,
                  padding: 1,
                  minHeight: 96,
                  opacity: isCurrentMonth ? 1 : 0.4,
                })}
              >
                <Typography variant="labelSmall">{day.getDate()}</Typography>
                {dayEntries.slice(0, 2).map((entry) => (
                  <EntryChip
                    key={entry.id}
                    entry={entry}
                    isDeloadWeek={isDeload(entry)}
                    onClick={(event) => setMenuAnchor({ el: event.currentTarget, entry })}
                  />
                ))}
                {dayEntries.length > 2 ? (
                  <Typography
                    variant="labelSmall"
                    sx={(innerTheme) => ({ color: themePalette(innerTheme).kokyu.text.secondary })}
                  >
                    +{dayEntries.length - 2} mais
                  </Typography>
                ) : null}
              </Stack>
            );
          })}
        </Box>
      )}

      {entries.length === 0 ? <EmptyState title="Nada planejado neste período." /> : null}

      <Menu anchorEl={menuAnchor?.el} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={handleStartReschedule}>Reagendar</MenuItem>
        {menuAnchor &&
        (menuAnchor.entry.status === 'planned' || menuAnchor.entry.status === 'missed') ? (
          <MenuItem onClick={handleSkip}>Pular</MenuItem>
        ) : null}
      </Menu>

      <Dialog
        open={Boolean(rescheduleTarget)}
        onClose={() => setRescheduleTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Reagendar treino</DialogTitle>
        <DialogContent>
          <KokyuDateField label="Nova data" value={rescheduleDate} onChange={setRescheduleDate} />
        </DialogContent>
        <DialogActions>
          <KokyuButton variant="text" onClick={() => setRescheduleTarget(null)}>
            Cancelar
          </KokyuButton>
          <KokyuButton variant="contained" onClick={confirmReschedule}>
            Mover para outra data
          </KokyuButton>
        </DialogActions>
      </Dialog>

      <ScheduleWorkoutDialog
        open={scheduleDialog.open}
        onClose={() => setScheduleDialog({ open: false })}
        onScheduled={reload}
        initialDate={scheduleDialog.date}
      />
    </Stack>
  );
}
