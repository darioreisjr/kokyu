import MovieRoundedIcon from '@mui/icons-material/MovieRounded';
import Typography from '@mui/material/Typography';
import type { HomeProviderResult, LeisureHomeProjection } from '@/shared/home/types';
import { HomeAreaCardShell } from '../HomeAreaCardShell/HomeAreaCardShell';

export interface HomeLeisureSummaryProps {
  result: HomeProviderResult<LeisureHomeProjection>;
  isLoading?: boolean;
  onOpen: () => void;
}

export function HomeLeisureSummary({ result, isLoading = false, onOpen }: HomeLeisureSummaryProps) {
  const data = result.data;
  const isEmpty = data !== null && !data.plannedToday && !data.inProgress;
  const item = data?.inProgress ?? data?.plannedToday ?? null;

  return (
    <HomeAreaCardShell
      title="Tempo Livre"
      icon={MovieRoundedIcon}
      status={isLoading ? 'loading' : result.status}
      isEmpty={isEmpty}
      emptyMessage="Nada planejado — hora de escolher algo?"
      actionLabel="Abrir Tempo Livre"
      onOpen={onOpen}
    >
      {item ? (
        <>
          <Typography variant="body1" noWrap>
            {item.title}
          </Typography>
          <Typography variant="caption" component="p" sx={{ mt: 0.25 }}>
            {data?.inProgress ? 'Em andamento' : item.startTime ? `Às ${item.startTime}` : 'Planejado para hoje'}
          </Typography>
        </>
      ) : null}
    </HomeAreaCardShell>
  );
}
