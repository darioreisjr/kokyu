'use client';

import { useEffect, useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';

import { KokyuButton } from '@/design-system/components';
import { calculateProjectProgress } from '../../services/engines/missionProjectProgressService';
import { isMissionOverdue } from '../../utils/missionDateStatus';
import { todayKey } from '../../utils/missionDateKey';
import { missionDb } from '../../services/missionMockDb';
import { missionService } from '../../services/missionService';
import type { Mission, MissionProject } from '../../types';
import { MissionRow } from '../MissionRow/MissionRow';

interface ReviewStepProps {
  title: string;
  missions: Mission[];
  defaultExpanded?: boolean;
  onRefresh: () => void;
  emptyMessage: string;
}

function ReviewStep({ title, missions, defaultExpanded, onRefresh, emptyMessage }: ReviewStepProps) {
  async function complete(id: string) {
    await missionService.completeMission(id);
    onRefresh();
  }
  async function cancel(id: string) {
    await missionService.cancelMission(id);
    onRefresh();
  }
  async function backlog(id: string) {
    await missionService.updateMission(id, { status: 'ready', plannedDate: undefined });
    onRefresh();
  }

  return (
    <Accordion defaultExpanded={defaultExpanded} variant="outlined" sx={{ borderRadius: 2, '&::before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
        <Typography variant="subtitle1">{title} ({missions.length})</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {missions.length === 0 ? (
          <Typography variant="body2" color="text.secondary">{emptyMessage}</Typography>
        ) : (
          <Stack spacing={1.5}>
            {missions.map((mission) => (
              <Stack key={mission.id} spacing={0.5}>
                <MissionRow mission={mission} />
                <Stack direction="row" spacing={1}>
                  <KokyuButton size="small" variant="outlined" onClick={() => complete(mission.id)}>Concluir</KokyuButton>
                  <KokyuButton size="small" variant="outlined" onClick={() => backlog(mission.id)}>Backlog</KokyuButton>
                  <KokyuButton size="small" variant="text" color="error" onClick={() => cancel(mission.id)}>Cancelar</KokyuButton>
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

/** Guided review — Inbox → Atrasadas → Aguardando → Bloqueadas → Sem data → Projetos → Próximos prazos → Limpeza (spec "REVISÃO DE MISSÕES"). */
export function ReviewMissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [projects, setProjects] = useState<MissionProject[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const refresh = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;
    missionService.getMissions().then((data) => {
      if (!cancelled) {
        setMissions(data);
        setProjects([...missionDb.projects]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const today = todayKey();
  const inbox = missions.filter((m) => m.status === 'inbox');
  const overdue = missions.filter((m) => isMissionOverdue(m, today));
  const waiting = missions.filter((m) => m.status === 'waiting');
  const blocked = missions.filter((m) => m.status === 'blocked');
  const noDate = missions.filter((m) => m.status === 'ready' && !m.plannedDate && !m.deadline);
  const upcomingDeadlines = missions
    .filter((m) => m.deadline && m.deadline >= today && m.status !== 'completed' && m.status !== 'cancelled' && m.status !== 'archived')
    .sort((a, b) => a.deadline!.localeCompare(b.deadline!))
    .slice(0, 10);
  const activeProjects = projects.filter((p) => p.status === 'active');

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>Revisão</Typography>
          <Typography variant="body1" color="text.secondary">
            Uma passada guiada pelo que precisa de atenção.
          </Typography>
        </Stack>

        <ReviewStep title="Inbox" missions={inbox} defaultExpanded onRefresh={refresh} emptyMessage="Sua caixa de entrada está organizada." />
        <ReviewStep title="Atrasadas" missions={overdue} onRefresh={refresh} emptyMessage="Nada atrasado." />
        <ReviewStep title="Aguardando" missions={waiting} onRefresh={refresh} emptyMessage="Nada aguardando retorno." />
        <ReviewStep title="Bloqueadas" missions={blocked} onRefresh={refresh} emptyMessage="Nenhuma missão bloqueada." />
        <ReviewStep title="Sem data" missions={noDate} onRefresh={refresh} emptyMessage="Nada pendente de planejamento." />

        <Accordion variant="outlined" sx={{ borderRadius: 2, '&::before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Typography variant="subtitle1">Projetos ativos ({activeProjects.length})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>
              {activeProjects.map((project) => {
                const progress = calculateProjectProgress(project.id, missions);
                return (
                  <Typography key={project.id} variant="body2">
                    {project.name} — {progress.percent}%
                  </Typography>
                );
              })}
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Accordion variant="outlined" sx={{ borderRadius: 2, '&::before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Typography variant="subtitle1">Próximos prazos ({upcomingDeadlines.length})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>
              {upcomingDeadlines.map((mission) => (
                <MissionRow key={mission.id} mission={mission} />
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Container>
  );
}
