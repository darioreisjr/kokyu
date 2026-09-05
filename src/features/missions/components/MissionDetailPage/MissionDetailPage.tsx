'use client';

import { useEffect, useState } from 'react';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';

import { KokyuButton } from '@/design-system/components';
import { getMissionAreaLabel } from '../../constants/missionAreas';
import { missionRoutes } from '../../constants/missionRoutes';
import { useMission } from '../../hooks/useMission';
import { calculateMissionProgress } from '../../services/engines/missionProgressService';
import { missionChecklistService } from '../../services/missionChecklistService';
import { missionDb } from '../../services/missionMockDb';
import { missionService } from '../../services/missionService';
import type { Mission, MissionActivity, MissionChecklistItem } from '../../types';
import { MissionActivityTimeline } from '../MissionActivityTimeline/MissionActivityTimeline';
import { MissionChecklist } from '../MissionChecklist/MissionChecklist';
import { MissionDateInfo } from '../MissionDateInfo/MissionDateInfo';
import { MissionDependencies } from '../MissionDependencies/MissionDependencies';
import { MissionDuration } from '../MissionDuration/MissionDuration';
import { MissionPriorityBadge } from '../MissionPriorityBadge/MissionPriorityBadge';
import { MissionRow } from '../MissionRow/MissionRow';

export interface MissionDetailPageProps {
  missionId: string;
}

export function MissionDetailPage({ missionId }: MissionDetailPageProps) {
  const { mission, isLoading, refresh } = useMission(missionId);
  const [checklist, setChecklist] = useState<MissionChecklistItem[]>([]);
  const [submissions, setSubmissions] = useState<Mission[]>([]);
  const [activity, setActivity] = useState<MissionActivity[]>([]);
  const [dependencyInfo, setDependencyInfo] = useState<{ blockedBy: string[]; blocks: string[]; isBlocked: boolean }>({
    blockedBy: [],
    blocks: [],
    isBlocked: false,
  });

  const [relatedReloadKey, setRelatedReloadKey] = useState(0);
  const reloadRelated = () => setRelatedReloadKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      missionChecklistService.getChecklistItems(missionId),
      missionService.getMissions(),
      missionService.getMissionActivity(missionId),
      missionService.getMissionDependencies(missionId),
    ]).then(([checklistItems, allMissions, activityLog, dependencies]) => {
      if (cancelled) return;
      setChecklist(checklistItems);
      setSubmissions(allMissions.filter((m) => m.parentMissionId === missionId));
      setActivity(activityLog);
      setDependencyInfo(dependencies);
    });
    return () => {
      cancelled = true;
    };
  }, [missionId, relatedReloadKey]);

  if (isLoading || !mission) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Stack sx={{ alignItems: 'center' }}>
          <CircularProgress />
        </Stack>
      </Container>
    );
  }

  const project = mission.projectId ? missionDb.projects.find((p) => p.id === mission.projectId) : undefined;
  const progress = calculateMissionProgress(mission, [...submissions, mission], checklist);

  async function handleToggleComplete() {
    if (!mission) return;
    if (mission.status === 'completed') {
      await missionService.reopenMission(mission.id);
    } else {
      await missionService.completeMission(mission.id);
    }
    await refresh();
    reloadRelated();
  }

  async function handleAddChecklistItem(text: string) {
    await missionChecklistService.addChecklistItem(missionId, text);
    reloadRelated();
  }

  async function handleToggleChecklistItem(id: string, completed: boolean) {
    await missionChecklistService.updateChecklistItem(id, { completed });
    reloadRelated();
  }

  async function handleDeleteChecklistItem(id: string) {
    await missionChecklistService.deleteChecklistItem(id);
    reloadRelated();
  }

  async function handleRemoveDependency(blockerMissionId: string) {
    const dependency = missionDb.dependencies.find(
      (d) => d.blockerMissionId === blockerMissionId && d.blockedMissionId === missionId,
    );
    if (dependency) {
      await missionService.removeMissionDependency(dependency.id);
      reloadRelated();
    }
  }

  const allMissionsById = Object.fromEntries(missionDb.missions.map((m) => [m.id, m]));

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Checkbox
              checked={mission.status === 'completed'}
              onChange={handleToggleComplete}
              slotProps={{ input: { 'aria-label': `Marcar "${mission.title}" como ${mission.status === 'completed' ? 'não concluída' : 'concluída'}` } }}
            />
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 700, textDecoration: mission.status === 'completed' ? 'line-through' : 'none' }}
            >
              {mission.title}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <MissionPriorityBadge priority={mission.priority} importance={mission.importance} />
            {mission.areaId && <Typography variant="caption" color="text.secondary">{getMissionAreaLabel(mission.areaId)}</Typography>}
          </Stack>
        </Stack>

        {/* Planejamento */}
        <Stack spacing={1.5}>
          <Typography variant="h6" component="h2">Planejamento</Typography>
          <MissionDateInfo mission={mission} />
          <MissionDuration estimatedDuration={mission.estimatedDuration} actualDurationMinutes={mission.actualDurationMinutes} />
        </Stack>

        {/* Projeto */}
        {project && (
          <Stack spacing={1}>
            <Typography variant="h6" component="h2">Projeto</Typography>
            <Typography
              component={NextLink}
              href={missionRoutes.projectDetail(project.id)}
              variant="body1"
              color="primary"
            >
              {project.name}
            </Typography>
          </Stack>
        )}

        {/* Conteúdo */}
        <Stack spacing={1.5}>
          <Typography variant="h6" component="h2">Conteúdo</Typography>
          {mission.description && <Typography variant="body1">{mission.description}</Typography>}

          {mission.progressMode === 'checklist' && (
            <MissionChecklist
              items={checklist}
              onAddItem={handleAddChecklistItem}
              onToggleItem={handleToggleChecklistItem}
              onDeleteItem={handleDeleteChecklistItem}
            />
          )}

          {mission.progressMode === 'submissions' && submissions.length > 0 && (
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                {progress.completed} de {progress.total} submissões concluídas
              </Typography>
              {submissions.map((submission) => (
                <MissionRow key={submission.id} mission={submission} onToggleComplete={() => missionService.completeMission(submission.id).then(reloadRelated)} />
              ))}
            </Stack>
          )}
        </Stack>

        {/* Relações */}
        {mission.goalIds.length > 0 && (
          <Stack spacing={1}>
            <Typography variant="h6" component="h2">Relações</Typography>
            <Typography variant="body2" color="text.secondary">
              Contribui para {mission.goalIds.length} meta{mission.goalIds.length > 1 ? 's' : ''}.
            </Typography>
          </Stack>
        )}

        {/* Dependências */}
        <MissionDependencies
          blockedBy={dependencyInfo.blockedBy.map((id) => ({ id, title: allMissionsById[id]?.title ?? id, isOpen: allMissionsById[id]?.status !== 'completed' && allMissionsById[id]?.status !== 'cancelled' && allMissionsById[id]?.status !== 'archived' }))}
          blocks={dependencyInfo.blocks.map((id) => ({ id, title: allMissionsById[id]?.title ?? id, isOpen: true }))}
          onRemove={handleRemoveDependency}
        />

        {mission.status === 'waiting' && (
          <Stack spacing={0.5}>
            <Typography variant="h6" component="h2">Aguardando</Typography>
            <Typography variant="body2">{mission.waitingFor ?? 'Aguardando retorno.'}</Typography>
            {mission.followUpAt && (
              <Typography variant="caption" color="text.secondary">Follow-up em {mission.followUpAt}</Typography>
            )}
          </Stack>
        )}

        <Divider />

        {/* Histórico */}
        <Stack spacing={1.5}>
          <Typography variant="h6" component="h2">Histórico</Typography>
          <MissionActivityTimeline activity={activity} />
        </Stack>

        <Stack direction="row" spacing={1}>
          <KokyuButton
            variant="outlined"
            color="error"
            onClick={async () => {
              await missionService.cancelMission(mission.id);
              await refresh();
            }}
          >
            Cancelar missão
          </KokyuButton>
          <KokyuButton
            variant="outlined"
            onClick={async () => {
              await missionService.archiveMission(mission.id);
              await refresh();
            }}
          >
            Arquivar
          </KokyuButton>
        </Stack>
      </Stack>
    </Container>
  );
}
