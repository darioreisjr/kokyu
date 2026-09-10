'use client';

import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { useMemo, useState } from 'react';

import { EmptyState, KokyuButton } from '@/design-system/components';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { cardTokens } from '@/design-system/tokens/component';
import { usePreferences } from '@/features/settings/providers/PreferencesProvider';
import { friendlyErrorMessage } from '@/lib/api/errors';

import { useConfirmAction } from '../../hooks/useConfirmAction';
import { useLeisurePlan } from '../../hooks/useLeisurePlan';
import { leisurePlanService } from '../../services/leisurePlanService';
import type { LeisurePlanEntry } from '../../types/leisurePlan.types';
import {
  formatDateHeading,
  formatWeekRangeHeading,
  getWeekDays,
  getWeekStart,
  isToday,
  toDateKey,
  todayOrLaterKey,
} from '../../utils/dateHelpers';
import { formatDuration } from '../../utils/durationFormat';
import { ConfirmActionDialog } from '../ConfirmActionDialog/ConfirmActionDialog';
import type { PlanEntryFormValues } from '../../schemas/planEntrySchema';
import { PlanEntryDialog } from '../PlanEntryDialog/PlanEntryDialog';

type ViewMode = 'day' | 'week';

function PlanEntryRow({
  entry,
  onEdit,
  onComplete,
  onRemove,
}: {
  entry: LeisurePlanEntry;
  onEdit: () => void;
  onComplete: () => void;
  onRemove: () => void;
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
      <Stack spacing={0.1} sx={{ minWidth: 0, flex: 1, cursor: 'pointer' }} onClick={onEdit}>
        <Typography variant="labelMedium" component="p" noWrap>
          {entry.title}
        </Typography>
        <Typography
          variant="labelSmall"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          {entry.startTime ?? 'Sem horário'}
          {entry.duration ? ` · ${formatDuration(entry.duration)}` : ''}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={0.5}>
        <KokyuButton
          variant={entry.completed ? 'text' : 'outlined'}
          size="small"
          disabled={entry.completed}
          onClick={onComplete}
        >
          {entry.completed ? 'Concluído' : 'Concluir'}
        </KokyuButton>
        <IconButton aria-label="Remover planejamento" size="small" onClick={onRemove}>
          <DeleteOutlineRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>
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
  const confirmAction = useConfirmAction();

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date(), weekStartsOn));
  const weekDays = useMemo(() => getWeekDays(weekStart, weekStartsOn), [weekStart, weekStartsOn]);

  const { status, planEntries, reload } = useLeisurePlan(
    viewMode === 'week' ? weekDays : [selectedDate],
  );

  const [dialogTarget, setDialogTarget] = useState<{
    defaultValues?: Partial<PlanEntryFormValues>;
    id?: string;
  } | null>(null);

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

  async function handleSave(values: PlanEntryFormValues) {
    // Left open on failure (e.g. the backend's own past-date defense-in-depth
    // check — see `findPastPlanEntryViolation` — rejecting a value the form
    // itself let through) so the user can correct it instead of losing it.
    try {
      if (dialogTarget?.id) {
        await leisurePlanService.updatePlanEntry(dialogTarget.id, values);
        showSuccess('Planejamento atualizado.');
      } else {
        await leisurePlanService.createPlanEntry(values);
        showSuccess('Atividade planejada.');
      }
      setDialogTarget(null);
      reload();
    } catch (error) {
      showError(friendlyErrorMessage(error, 'Não foi possível salvar o planejamento agora.'));
    }
  }

  function handleComplete(entry: LeisurePlanEntry) {
    // `occurrenceDate` — completing a daily/weekly entry from one day's
    // row must never mark any other day of the series as done.
    leisurePlanService.completePlanEntry(entry.id, entry.occurrenceDate).then(() => {
      showSuccess('Planejamento concluído.');
      reload();
    });
  }

  function handleRemove(entry: LeisurePlanEntry) {
    confirmAction.request({
      title: 'Remover planejamento?',
      description: `"${entry.title}" será removido do seu planejamento.`,
      confirmLabel: 'Remover',
      onConfirm: () => {
        leisurePlanService.deletePlanEntry(entry.id).then(() => {
          showSuccess('Planejamento removido.');
          reload();
        });
      },
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
        <KokyuButton
          variant="contained"
          onClick={() =>
            setDialogTarget({
              defaultValues: {
                date: todayOrLaterKey(viewMode === 'week' ? weekDays[0]! : selectedDate),
              },
            })
          }
        >
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
        ) : (
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
        )}
      </Stack>

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
            <KokyuButton
              variant="contained"
              onClick={() =>
                setDialogTarget({ defaultValues: { date: todayOrLaterKey(selectedDate) } })
              }
            >
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
                          onEdit={() => setDialogTarget({ id: entry.id, defaultValues: entry })}
                          onComplete={() => handleComplete(entry)}
                          onRemove={() => handleRemove(entry)}
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

      <PlanEntryDialog
        open={Boolean(dialogTarget)}
        defaultValues={dialogTarget?.defaultValues}
        mode={dialogTarget?.id ? 'edit' : 'create'}
        onClose={() => setDialogTarget(null)}
        onSave={handleSave}
      />

      <ConfirmActionDialog
        request={confirmAction.pending}
        onConfirm={confirmAction.confirm}
        onCancel={confirmAction.cancel}
      />
    </Stack>
  );
}
