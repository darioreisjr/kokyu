'use client';

import { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { EmptyState, KokyuButton } from '@/design-system/components';
import { useInboxMissions } from '../../hooks/useInboxMissions';
import { useMissionProjects } from '../../hooks/useMissionProjects';
import { missionService } from '../../services/missionService';
import type { Mission } from '../../types';
import { MissionQuickCapture } from '../MissionQuickCapture/MissionQuickCapture';
import { MissionRow } from '../MissionRow/MissionRow';

/** Guided quick-processing per item (spec "INBOX PROCESSING") — one action always resolves the item out of Inbox. */
function InboxItemActions({ mission, onProcessed }: { mission: Mission; onProcessed: () => void }) {
  const [busy, setBusy] = useState(false);

  async function run(action: Parameters<typeof missionService.processInboxMission>[1]) {
    setBusy(true);
    try {
      await missionService.processInboxMission(mission.id, action);
      onProcessed();
    } finally {
      setBusy(false);
    }
  }

  const today = new Date().toISOString().split('T')[0]!;

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
      <KokyuButton size="small" variant="outlined" disabled={busy} onClick={() => run({ type: 'doToday', plannedDate: today })}>
        Fazer hoje
      </KokyuButton>
      <KokyuButton size="small" variant="outlined" disabled={busy} onClick={() => run({ type: 'backlog' })}>
        Backlog
      </KokyuButton>
      <KokyuButton size="small" variant="outlined" disabled={busy} onClick={() => run({ type: 'setPriority', priority: 'high' })}>
        Prioridade alta
      </KokyuButton>
      <KokyuButton size="small" color="error" variant="text" disabled={busy} onClick={() => run({ type: 'delete' })}>
        Excluir
      </KokyuButton>
    </Stack>
  );
}

export function InboxMissionsPage() {
  const { missions, isLoading, refresh } = useInboxMissions();
  const { projects } = useMissionProjects();

  async function handleCapture(title: string) {
    await missionService.createMission({ title, status: 'inbox' });
    await refresh();
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Inbox
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Processe rapidamente o que ainda não foi organizado.
          </Typography>
        </Stack>

        <MissionQuickCapture onCapture={handleCapture} placeholder="Capturar algo novo…" />

        {isLoading ? (
          <Stack sx={{ alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Stack>
        ) : missions.length === 0 ? (
          <EmptyState title="Sua caixa de entrada está organizada." />
        ) : (
          <Stack spacing={2}>
            {missions.map((mission) => (
              <Stack key={mission.id} spacing={1} data-testid={`inbox-item-${mission.id}`}>
                <MissionRow mission={mission} projectName={projects.find((p) => p.id === mission.projectId)?.name} />
                <InboxItemActions mission={mission} onProcessed={refresh} />
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
