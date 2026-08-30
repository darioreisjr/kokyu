'use client';

import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';

import { EmptyState } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { useRoutines } from '../../hooks/useRoutines';
import { useTrainingPreferences } from '../../hooks/useTrainingPreferences';
import { useWorkoutHistory } from '../../hooks/useWorkoutHistory';
import { useWorkoutSession } from '../../hooks/useWorkoutSession';
import { sessionService, type WorkoutHistoryFilters } from '../../services/sessionService';
import type { PerformedSet, WorkoutSession } from '../../types';
import { groupSessionsByRecency } from '../../utils/sessionFilters';
import { SessionDetailDialog } from '../SessionDetailDialog/SessionDetailDialog';
import { SessionSummaryCard } from '../SessionSummaryCard/SessionSummaryCard';

export function TrainingHistoryPage() {
  const [filters, setFilters] = useState<WorkoutHistoryFilters>({});
  const { status, sessions, reload } = useWorkoutHistory(filters);
  const { routines } = useRoutines();
  const { preferences } = useTrainingPreferences();
  const [openSessionId, setOpenSessionId] = useState<string | null>(null);
  const {
    session: openSession,
    performedSets: openPerformedSets,
    reload: reloadOpenSession,
  } = useWorkoutSession(openSessionId ?? '__none__');

  const groups = useMemo(() => groupSessionsByRecency(sessions), [sessions]);
  const performedSetsBySessionId = useSessionPerformedSetsMap(sessions);

  function handleClose() {
    setOpenSessionId(null);
  }

  function handleUpdated() {
    reloadOpenSession();
    reload();
  }

  function handleDeleted() {
    setOpenSessionId(null);
    reload();
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="displaySmall" component="h1">
          Histórico
        </Typography>
        <Typography
          variant="body1"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          Todas as sessões que você já concluiu.
        </Typography>
      </Stack>

      <FormControl size="small" sx={{ maxWidth: 240 }}>
        <InputLabel id="history-routine-filter-label">Rotina</InputLabel>
        <Select
          labelId="history-routine-filter-label"
          label="Rotina"
          value={filters.routineId ?? ''}
          onChange={(event) =>
            setFilters({ ...filters, routineId: event.target.value || undefined })
          }
        >
          <MenuItem value="">Todas</MenuItem>
          {routines.map((routine) => (
            <MenuItem key={routine.id} value={routine.id}>
              {routine.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {status === 'loading' ? (
        <Stack spacing={1.5}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={90} />
          ))}
        </Stack>
      ) : status === 'error' ? (
        <Alert severity="error">Não foi possível carregar o histórico.</Alert>
      ) : sessions.length === 0 ? (
        <EmptyState icon={HistoryRoundedIcon} title="Nenhuma sessão concluída ainda." />
      ) : (
        <Stack spacing={3}>
          {groups.map((group) => (
            <Stack key={group.label} spacing={1.5}>
              <Typography variant="labelLarge">{group.label}</Typography>
              {group.sessions.map((session) => (
                <SessionSummaryCard
                  key={session.id}
                  session={session}
                  performedSets={performedSetsBySessionId.get(session.id) ?? []}
                  weightUnit={preferences?.weightUnit ?? 'kg'}
                  onOpen={() => setOpenSessionId(session.id)}
                />
              ))}
            </Stack>
          ))}
        </Stack>
      )}

      <SessionDetailDialog
        open={Boolean(openSessionId)}
        session={openSession}
        performedSets={openPerformedSets}
        weightUnit={preferences?.weightUnit ?? 'kg'}
        onClose={handleClose}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />
    </Stack>
  );
}

/** `SessionSummaryCard` needs each session's performed sets for its volume figure — fetched once for the whole visible list rather than per-card. */
function useSessionPerformedSetsMap(sessions: WorkoutSession[]): Map<string, PerformedSet[]> {
  const [map, setMap] = useState<Map<string, PerformedSet[]>>(new Map());

  useEffect(() => {
    let cancelled = false;
    Promise.all(sessions.map((session) => sessionService.getPerformedSets(session.id))).then(
      (results) => {
        if (cancelled) return;
        setMap(new Map(sessions.map((session, index) => [session.id, results[index]!])));
      },
    );
    return () => {
      cancelled = true;
    };
  }, [sessions]);

  return map;
}
