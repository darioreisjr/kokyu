'use client';

import { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { KokyuButton } from '@/design-system/components';
import { useMissionProject } from '../../hooks/useMissionProject';
import { missionDb } from '../../services/missionMockDb';
import type { Mission } from '../../types';
import type { OpenMissionsOnCompleteAction } from '../../services/missionProjectService';
import { missionProjectService } from '../../services/missionProjectService';
import { missionService } from '../../services/missionService';
import { MissionBoard } from '../MissionBoard/MissionBoard';
import { MissionList } from '../MissionList/MissionList';
import { MissionProjectHeader } from '../MissionProjectHeader/MissionProjectHeader';

export interface ProjectDetailPageProps {
  projectId: string;
}

export function ProjectDetailPage({ projectId }: ProjectDetailPageProps) {
  const { project, sections, missions, progress, nextAction, isLoading, refresh } = useMissionProject(projectId);
  const [view, setView] = useState<'list' | 'board'>('list');
  const [confirmComplete, setConfirmComplete] = useState(false);

  async function handleToggleCompleteMission(mission: Mission) {
    if (mission.status === 'completed') {
      await missionService.reopenMission(mission.id);
    } else {
      await missionService.completeMission(mission.id);
    }
    refresh();
  }

  async function completeProjectWithAction(action: OpenMissionsOnCompleteAction) {
    await missionProjectService.completeProject(projectId, action);
    setConfirmComplete(false);
    refresh();
  }

  async function handleArchive() {
    await missionProjectService.archiveProject(projectId);
    refresh();
  }

  const openMissionsCount = missions.filter(
    (m) => m.status !== 'completed' && m.status !== 'cancelled' && m.status !== 'archived',
  ).length;

  if (isLoading || !project) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Stack sx={{ alignItems: 'center' }}>
          <CircularProgress />
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <MissionProjectHeader
          project={project}
          progress={progress}
          nextActionTitle={nextAction?.title}
          onComplete={() => (openMissionsCount > 0 ? setConfirmComplete(true) : completeProjectWithAction('keep'))}
          onArchive={handleArchive}
        />

        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, value) => value && setView(value)}
          size="small"
          aria-label="Alternar visualização do projeto"
        >
          <ToggleButton value="list">Lista</ToggleButton>
          <ToggleButton value="board">Board</ToggleButton>
        </ToggleButtonGroup>

        {view === 'list' ? (
          <MissionList
            missions={missions}
            dependencies={missionDb.dependencies}
            group="section"
            getProjectName={() => project.name}
            getSectionName={(id) => sections.find((s) => s.id === id)?.name ?? ''}
            getBlockedByCount={() => 0}
            onToggleComplete={handleToggleCompleteMission}
          />
        ) : (
          <MissionBoard
            sections={sections}
            missions={missions}
            onMoveToSection={async (missionId, sectionId) => {
              await missionService.updateMission(missionId, { sectionId });
              refresh();
            }}
          />
        )}
      </Stack>

      <Dialog open={confirmComplete} onClose={() => setConfirmComplete(false)}>
        <DialogTitle>Concluir projeto mesmo assim?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {openMissionsCount} missõe{openMissionsCount > 1 ? 's' : ''} ainda est
            {openMissionsCount > 1 ? 'ão' : 'á'} em aberto neste projeto.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <KokyuButton variant="text" onClick={() => setConfirmComplete(false)}>
            Cancelar
          </KokyuButton>
          <KokyuButton variant="outlined" onClick={() => completeProjectWithAction('moveToBacklog')}>
            Mover abertas para o backlog
          </KokyuButton>
          <KokyuButton variant="outlined" color="error" onClick={() => completeProjectWithAction('cancel')}>
            Cancelar abertas
          </KokyuButton>
          <KokyuButton variant="contained" onClick={() => completeProjectWithAction('keep')}>
            Concluir mesmo assim
          </KokyuButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
