'use client';

import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import NextLink from 'next/link';
import { useMemo, useState } from 'react';

import { EmptyState, KokyuButton } from '@/design-system/components';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { cardTokens } from '@/design-system/tokens/component';
import { usePreferences } from '@/features/settings/providers/PreferencesProvider';
import { friendlyErrorMessage } from '@/lib/api/errors';

import { leisureRoutes } from '../../constants/leisureRoutes';
import { useArchivedPlanEntries } from '../../hooks/useArchivedPlanEntries';
import { useLeisurePlan } from '../../hooks/useLeisurePlan';
import { leisurePlanService } from '../../services/leisurePlanService';
import type { LeisurePlanEntry } from '../../types/leisurePlan.types';
import {
  formatDateHeading,
  formatWeekRangeHeading,
  fromDateKey,
  getWeekDays,
  getWeekStart,
  isToday,
  toDateKey,
  todayOrLaterKey,
} from '../../utils/dateHelpers';
import { formatDuration, formatTime } from '../../utils/durationFormat';
import { PlanEntryDetailDialog } from '../PlanEntryDetailDialog/PlanEntryDetailDialog';

type ViewMode = 'day' | 'week' | 'archived';

function PlanEntryRow({
  entry,
  onComplete,
  onOpenDetails,
}: {
  entry: LeisurePlanEntry;
  onComplete: () => void;
  onOpenDetails: () => void;
}) {
  return (
    <Stack
      spacing={1}
      sx={(theme) => ({
        borderRadius: 1,
        border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        padding: 1.5,
      })}
    >
      <ButtonBase
        onClick={onOpenDetails}
        aria-label={`Ver detalhes de ${entry.title}`}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          width: '100%',
          minWidth: 0,
          borderRadius: 1,
          textAlign: 'left',
        }}
      >
        <Typography variant="labelMedium" component="p" noWrap sx={{ width: '100%' }}>
          {entry.title}
        </Typography>
        <Typography
          variant="labelSmall"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          {entry.startTime ? formatTime(entry.startTime) : 'Sem horário'}
          {entry.duration ? ` · ${formatDuration(entry.duration)}` : ''}
        </Typography>
      </ButtonBase>
      {/* Only today's occurrence is completable — a future/past card would
          be an easy accidental tap, and the backend rejects it anyway (see
          `LeisurePlanService.complete`). A completed one still shows its
          "Concluído" state regardless of day, so history stays visible. */}
      {entry.completed || entry.occurrenceDate === toDateKey(new Date()) ? (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
          <KokyuButton
            variant={entry.completed ? 'text' : 'outlined'}
            size="small"
            disabled={entry.completed}
            onClick={onComplete}
          >
            {entry.completed ? 'Concluído' : 'Concluir'}
          </KokyuButton>
        </Stack>
      ) : null}
    </Stack>
  );
}

function ArchivedEntryRow({
  entry,
  onUnarchive,
  onOpenDetails,
}: {
  entry: LeisurePlanEntry;
  onUnarchive: () => void;
  onOpenDetails: () => void;
}) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={(theme) => ({
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 1,
        border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        padding: 1.5,
      })}
    >
      <ButtonBase
        onClick={onOpenDetails}
        aria-label={`Ver detalhes de ${entry.title}`}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          minWidth: 0,
          flex: 1,
          borderRadius: 1,
          textAlign: 'left',
        }}
      >
        <Typography variant="labelMedium" component="p" noWrap sx={{ width: '100%' }}>
          {entry.title}
        </Typography>
        <Typography
          variant="labelSmall"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          {formatDateHeading(fromDateKey(entry.date))}
          {entry.startTime ? ` · ${formatTime(entry.startTime)}` : ''}
        </Typography>
      </ButtonBase>
      <KokyuButton variant="outlined" size="small" onClick={onUnarchive}>
        Desarquivar
      </KokyuButton>
    </Stack>
  );
}

/**
 * `/app/tempo-livre/planejamento` — Hoje/Semana, using the same
 * locale/timezone/week-start as the rest of Kokyu (Settings), never a
 * second calendar convention. `LeisurePlanEntry` always references
 * `leisureItemId` by id, so the same movie/hobby can be planned again
 * without duplicating it.
 */
export function PlannerPage() {
  const { preferences } = usePreferences();
  const weekStartsOn = preferences.locale.weekStartsOn;
  const { showSuccess, showError } = useSnackbar();

  const [detailEntry, setDetailEntry] = useState<LeisurePlanEntry | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date(), weekStartsOn));
  const weekDays = useMemo(() => getWeekDays(weekStart, weekStartsOn), [weekStart, weekStartsOn]);

  const { status, planEntries, reload } = useLeisurePlan(
    viewMode === 'week' ? weekDays : viewMode === 'day' ? [selectedDate] : [],
  );
  const {
    status: archivedStatus,
    archivedEntries,
    reload: reloadArchived,
  } = useArchivedPlanEntries(viewMode === 'archived');

  // Grouped by `occurrenceDate`, never `date` (the series' anchor) — a
  // daily/weekly entry is one row expanded by the backend into one
  // occurrence per day it lands on, and each belongs on its own day here.
  const entriesByDate = useMemo(() => {
    const map = new Map<string, LeisurePlanEntry[]>();
    for (const entry of planEntries) {
      const list = map.get(entry.occurrenceDate) ?? [];
      list.push(entry);
      map.set(
        entry.occurrenceDate,
        [...list].sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? '')),
      );
    }
    return map;
  }, [planEntries]);

  const daysToShow = viewMode === 'week' ? weekDays : [selectedDate];

  // Whichever day the CTA's own view is currently anchored to — carried to
  // `/planejamento/nova` as `?date=` so the new page still defaults to the
  // day being looked at, not always "today".
  const planNewHref = `${leisureRoutes.planNew}?date=${todayOrLaterKey(viewMode === 'week' ? weekDays[0]! : selectedDate)}`;

  function handleComplete(entry: LeisurePlanEntry) {
    // `occurrenceDate` — completing a daily/weekly entry from one day's
    // row must never mark any other day of the series as done.
    leisurePlanService
      .completePlanEntry(entry.id, entry.occurrenceDate)
      .then(() => {
        showSuccess('Planejamento concluído.');
        reload();
      })
      .catch((error) => {
        // Reachable if the day rolls over between this card rendering and
        // the click — the button is only shown for today's occurrence, but
        // the backend has the last word (see `LeisurePlanService.complete`).
        showError(friendlyErrorMessage(error, 'Não foi possível concluir agora.'));
        reload();
      });
  }

  function handleUnarchive(entry: LeisurePlanEntry) {
    leisurePlanService
      .unarchivePlanEntry(entry.id)
      .then(() => {
        showSuccess('Planejamento desarquivado.');
        setDetailEntry(null);
        reloadArchived();
      })
      .catch((error) => {
        showError(friendlyErrorMessage(error, 'Não foi possível desarquivar agora.'));
      });
  }

  return (
    <Stack spacing={4}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' } }}
      >
        <Stack spacing={0.5}>
          <Typography variant="displaySmall" component="h1">
            Planejamento
          </Typography>
          <Typography
            variant="body1"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Organize seu tempo livre com antecedência.
          </Typography>
        </Stack>
        <KokyuButton variant="contained" component={NextLink} href={planNewHref}>
          Planejar atividade
        </KokyuButton>
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_event, next: ViewMode | null) => next && setViewMode(next)}
          size="small"
          aria-label="Visualização"
        >
          <ToggleButton value="day" sx={{ textTransform: 'none' }}>
            Hoje
          </ToggleButton>
          <ToggleButton value="week" sx={{ textTransform: 'none' }}>
            Semana
          </ToggleButton>
          <ToggleButton value="archived" sx={{ textTransform: 'none' }}>
            Arquivados
          </ToggleButton>
        </ToggleButtonGroup>

        {viewMode === 'week' ? (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <IconButton
              aria-label="Semana anterior"
              size="small"
              onClick={() => setWeekStart(addDays(weekStart, -7))}
            >
              <ChevronLeftRoundedIcon fontSize="small" />
            </IconButton>
            <Typography variant="labelLarge">{formatWeekRangeHeading(weekStart)}</Typography>
            <IconButton
              aria-label="Próxima semana"
              size="small"
              onClick={() => setWeekStart(addDays(weekStart, 7))}
            >
              <ChevronRightRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        ) : viewMode === 'day' ? (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <IconButton
              aria-label="Dia anterior"
              size="small"
              onClick={() => setSelectedDate((current) => addDays(current, -1))}
            >
              <ChevronLeftRoundedIcon fontSize="small" />
            </IconButton>
            <Typography variant="labelLarge">{formatDateHeading(selectedDate)}</Typography>
            <IconButton
              aria-label="Próximo dia"
              size="small"
              onClick={() => setSelectedDate((current) => addDays(current, 1))}
            >
              <ChevronRightRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        ) : null}
      </Stack>

      {viewMode === 'archived' ? (
        <>
          {archivedStatus === 'loading' ? <Skeleton variant="rounded" height={280} /> : null}
          {archivedStatus === 'error' ? (
            <Alert severity="error">
              Não foi possível carregar os planejamentos arquivados agora. Tente novamente.
            </Alert>
          ) : null}
          {archivedStatus === 'ready' && archivedEntries.length === 0 ? (
            <Typography
              variant="body2"
              sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
            >
              Nenhum planejamento arquivado.
            </Typography>
          ) : null}
          {archivedStatus === 'ready' && archivedEntries.length > 0 ? (
            <Stack spacing={1}>
              {archivedEntries.map((entry) => (
                <ArchivedEntryRow
                  key={entry.id}
                  entry={entry}
                  onUnarchive={() => handleUnarchive(entry)}
                  onOpenDetails={() => setDetailEntry(entry)}
                />
              ))}
            </Stack>
          ) : null}
        </>
      ) : (
        <>
          {status === 'loading' ? <Skeleton variant="rounded" height={280} /> : null}
          {status === 'error' ? (
            <Alert severity="error">
              Não foi possível carregar o planejamento agora. Tente novamente.
            </Alert>
          ) : null}

          {status === 'ready' && planEntries.length === 0 ? (
            <EmptyState
              icon={CalendarMonthRoundedIcon}
              title="Sua semana ainda não tem atividades planejadas."
              action={
                <KokyuButton variant="contained" component={NextLink} href={planNewHref}>
                  Planejar primeira atividade
                </KokyuButton>
              }
            />
          ) : null}

          {status === 'ready' && planEntries.length > 0 ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns:
                  viewMode === 'week'
                    ? { xs: '1fr', sm: 'repeat(auto-fill, minmax(220px, 1fr))' }
                    : '1fr',
                gap: 2,
              }}
            >
              {daysToShow.map((day) => {
                const dateKey = toDateKey(day);
                const dayEntries = entriesByDate.get(dateKey) ?? [];
                return (
                  <Paper
                    key={dateKey}
                    elevation={0}
                    sx={(theme) => ({
                      borderRadius: cardTokens.radius,
                      border: `1px solid ${isToday(day) ? themePalette(theme).kokyu.border.focus : themePalette(theme).kokyu.border.subtle}`,
                      padding: 2,
                    })}
                  >
                    <Stack spacing={1.5}>
                      {viewMode === 'week' ? (
                        <Typography variant="labelLarge">
                          {format(day, 'EEEE', { locale: ptBR }).replace(/^./, (letter) =>
                            letter.toUpperCase(),
                          )}
                          , {format(day, 'd')}
                        </Typography>
                      ) : null}
                      {dayEntries.length === 0 ? (
                        <Typography
                          variant="body2"
                          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                        >
                          Nada planejado.
                        </Typography>
                      ) : (
                        <Stack spacing={1}>
                          {dayEntries.map((entry) => (
                            <PlanEntryRow
                              key={entry.id}
                              entry={entry}
                              onComplete={() => handleComplete(entry)}
                              onOpenDetails={() => setDetailEntry(entry)}
                            />
                          ))}
                        </Stack>
                      )}
                    </Stack>
                  </Paper>
                );
              })}
            </Box>
          ) : null}
        </>
      )}

      <PlanEntryDetailDialog
        entry={detailEntry}
        onClose={() => setDetailEntry(null)}
        onUnarchive={handleUnarchive}
      />
    </Stack>
  );
}
