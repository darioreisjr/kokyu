'use client';

import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';

import { useMissionProjects } from '../../hooks/useMissionProjects';
import { missionRoutes } from '../../constants/missionRoutes';
import { missionFormValuesToInput } from '../../utils/missionFormMapper';
import { missionService } from '../../services/missionService';
import { MissionForm } from '../MissionForm/MissionForm';

export function NewMissionPage() {
  const router = useRouter();
  const { projects } = useMissionProjects();

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Nova missão
        </Typography>

        <MissionForm
          projects={projects}
          onSubmit={async (values) => {
            const mission = await missionService.createMission(missionFormValuesToInput(values));
            router.push(missionRoutes.detail(mission.id));
          }}
          onCancel={() => router.push(missionRoutes.today)}
        />
      </Stack>
    </Container>
  );
}
