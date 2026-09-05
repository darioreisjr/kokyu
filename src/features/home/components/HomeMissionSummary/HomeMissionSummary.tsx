import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import Typography from '@mui/material/Typography';
import type { HomeProviderResult, MissionHomeProjection } from '@/shared/home/types';
import { HomeAreaCardShell } from '../HomeAreaCardShell/HomeAreaCardShell';

export interface HomeMissionSummaryProps {
  result: HomeProviderResult<MissionHomeProjection>;
  isLoading?: boolean;
  onOpen: () => void;
}

export function HomeMissionSummary({ result, isLoading = false, onOpen }: HomeMissionSummaryProps) {
  const data = result.data;
  const isEmpty = data !== null && data.pendingCount === 0 && data.completedCount === 0 && !data.next;

  return (
    <HomeAreaCardShell
      title="Missões"
      icon={AssignmentRoundedIcon}
      status={isLoading ? 'loading' : result.status}
      isEmpty={isEmpty}
      emptyMessage="Nenhuma missão para hoje."
      actionLabel="Abrir Missões"
      onOpen={onOpen}
    >
      {data ? (
        <>
          <Typography variant="body1">
            {data.pendingCount} para hoje • {data.completedCount} concluídas
          </Typography>
          {data.next ? (
            <Typography variant="caption" component="p" sx={{ mt: 0.25 }}>
              Próxima: {data.next.title}
            </Typography>
          ) : null}
        </>
      ) : null}
    </HomeAreaCardShell>
  );
}
