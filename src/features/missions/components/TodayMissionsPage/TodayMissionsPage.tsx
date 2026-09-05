'use client';

import { useEffect, useMemo, useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import NextLink from 'next/link';

import { EmptyState, KokyuButton } from '@/design-system/components';
import { missionRoutes } from '../../constants/missionRoutes';
import { useTodayMissions } from '../../hooks/useTodayMissions';
import { missionService } from '../../services/missionService';
import { missionDb } from '../../services/missionMockDb';
import type { Mission, MissionSuggestion } from '../../types';
import { MissionQuickCapture } from '../MissionQuickCapture/MissionQuickCapture';
import { MissionRow } from '../MissionRow/MissionRow';
import { MissionSuggestions } from '../MissionSuggestions/MissionSuggestions';

function getProjectName(id: string): string {
  return missionDb.projects.find((p) => p.id === id)?.name ?? '';
}

export function TodayMissionsPage() {
  const [focusedIds, setFocusedIds] = useState<string[]>([]);
  const { missions, isLoading, refresh } = useTodayMissions(focusedIds);
  const [suggestions, setSuggestions] = useState<MissionSuggestion[]>([]);
  const [allMissionsById, setAllMissionsById] = useState<Record<string, Mission>>({});
  const [blockedCounts, setBlockedCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    Promise.all([missionService.getMissionSuggestions(), missionService.getMissions()]).then(
      ([suggestionList, allMissions]) => {
        if (!cancelled) {
          setSuggestions(suggestionList);
          setAllMissionsById(Object.fromEntries(allMissions.map((m) => [m.id, m])));
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [missions]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(missions.map((m) => missionService.getOpenBlockerCount(m.id))).then((counts) => {
      if (!cancelled) {
        setBlockedCounts(Object.fromEntries(missions.map((m, i) => [m.id, counts[i] ?? 0])));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [missions]);

  const focus = useMemo(() => missions.filter((m) => focusedIds.includes(m.id) && m.status !== 'completed'), [missions, focusedIds]);
  const planned = useMemo(
    () => missions.filter((m) => m.status === 'planned' && !focusedIds.includes(m.id)),
    [missions, focusedIds],
  );
  const toDoToday = useMemo(
    () =>
      missions.filter(
        (m) => m.status !== 'completed' && m.status !== 'planned' && m.status !== 'waiting' && !focusedIds.includes(m.id),
      ),
    [missions, focusedIds],
  );
  const waiting = useMemo(() => missions.filter((m) => m.status === 'waiting'), [missions]);
  const completed = useMemo(() => missions.filter((m) => m.status === 'completed'), [missions]);

  async function handleCapture(title: string) {
    await missionService.createMission({
      title,
      status: 'planned',
      plannedDate: new Date().toISOString().split('T')[0],
    });
    await refresh();
  }

  async function handleToggleComplete(mission: Mission) {
    if (mission.status === 'completed') {
      await missionService.reopenMission(mission.id);
    } else {
      await missionService.completeMission(mission.id);
    }
    await refresh();
  }

  async function handleAddSuggestionToToday(missionId: string) {
    const today = new Date().toISOString().split('T')[0]!;
    await missionService.updateMission(missionId, { status: 'planned', plannedDate: today });
    await refresh();
  }

  function renderSection(title: string, list: Mission[], options?: { allowFocusToggle?: boolean }) {
    if (list.length === 0) return null;
    return (
      <Stack spacing={1}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Stack spacing={1}>
          {list.map((mission) => (
            <Stack key={mission.id} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <MissionRow
                mission={mission}
                projectName={mission.projectId ? getProjectName(mission.projectId) : undefined}
                blockedByCount={blockedCounts[mission.id] ?? 0}
                onToggleComplete={handleToggleComplete}
              />
              {options?.allowFocusToggle && (
                <KokyuButton
                  size="small"
                  variant="text"
                  onClick={() => setFocusedIds((ids) => ids.filter((id) => id !== mission.id))}
                >
                  Remover do foco
                </KokyuButton>
              )}
            </Stack>
          ))}
        </Stack>
      </Stack>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Hoje
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Qual missão merece seu foco agora?
          </Typography>
        </Stack>

        <MissionQuickCapture onCapture={handleCapture} autoFocus />

        {isLoading ? (
          <Stack sx={{ alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Stack>
        ) : missions.length === 0 ? (
          <EmptyState
            title="Nenhuma missão planejada para hoje."
            description="Adicione uma missão ou confira as sugestões abaixo."
            action={
              <KokyuButton component={NextLink} href={missionRoutes.new} variant="contained" startIcon={<AddRoundedIcon />}>
                Adicionar missão
              </KokyuButton>
            }
          />
        ) : (
          <Stack spacing={3}>
            {renderSection('Em foco', focus, { allowFocusToggle: true })}
            {renderSection('Planejadas', planned)}
            {renderSection('Para fazer hoje', toDoToday)}
            {renderSection('Aguardando retorno', waiting)}

            {completed.length > 0 && (
              <Accordion disableGutters variant="outlined" sx={{ borderRadius: 2, '&::before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                  <Typography variant="subtitle1">Concluídas ({completed.length})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={1}>
                    {completed.map((mission) => (
                      <MissionRow key={mission.id} mission={mission} onToggleComplete={handleToggleComplete} />
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}
          </Stack>
        )}

        <Stack spacing={1.5}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            Sugestões
          </Typography>
          <MissionSuggestions suggestions={suggestions} missionsById={allMissionsById} onAddToToday={handleAddSuggestionToToday} />
        </Stack>
      </Stack>
    </Container>
  );
}
