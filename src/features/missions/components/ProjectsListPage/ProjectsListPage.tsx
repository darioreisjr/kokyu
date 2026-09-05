'use client';

import { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

import { EmptyState, KokyuButton } from '@/design-system/components';
import { useMissionProjects } from '../../hooks/useMissionProjects';
import { calculateProjectProgress } from '../../services/engines/missionProjectProgressService';
import { getProjectNextAction } from '../../services/engines/projectNextActionService';
import { missionDb } from '../../services/missionMockDb';
import { missionProjectService } from '../../services/missionProjectService';
import { MissionProjectCard } from '../MissionProjectCard/MissionProjectCard';
import { MissionQuickCapture } from '../MissionQuickCapture/MissionQuickCapture';

export function ProjectsListPage() {
  const { projects, isLoading, refresh } = useMissionProjects();
  const [showCreate, setShowCreate] = useState(false);

  async function handleCreate(name: string) {
    await missionProjectService.createProject({ name, status: 'active' });
    setShowCreate(false);
    await refresh();
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack spacing={0.5}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Projetos
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Conjuntos de missões relacionadas a um resultado.
            </Typography>
          </Stack>
          <KokyuButton variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setShowCreate((v) => !v)}>
            Novo projeto
          </KokyuButton>
        </Stack>

        {showCreate && <MissionQuickCapture onCapture={handleCreate} placeholder="Nome do projeto…" autoFocus />}

        {isLoading ? (
          <Stack sx={{ alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Stack>
        ) : projects.length === 0 ? (
          <EmptyState title="Crie um projeto para organizar ações relacionadas." />
        ) : (
          <Grid container spacing={2}>
            {projects.map((project) => {
              const progress = calculateProjectProgress(project.id, missionDb.missions);
              const nextAction = getProjectNextAction(project.id, missionDb.missions, missionDb.dependencies);
              return (
                <Grid key={project.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <MissionProjectCard project={project} progress={progress} nextActionTitle={nextAction?.title} />
                </Grid>
              );
            })}
          </Grid>
        )}
      </Stack>
    </Container>
  );
}
