import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import Typography from '@mui/material/Typography';
import type { HabitHomeProjection, HomeProviderResult } from '@/shared/home/types';
import { HomeAreaCardShell } from '../HomeAreaCardShell/HomeAreaCardShell';

export interface HomeHabitSummaryProps {
  result: HomeProviderResult<HabitHomeProjection>;
  isLoading?: boolean;
  onOpen: () => void;
}

/** Streak is deliberately absent here — see spec's "Não fazer streak dominar Home." */
export function HomeHabitSummary({ result, isLoading = false, onOpen }: HomeHabitSummaryProps) {
  const data = result.data;
  const isEmpty = data !== null && data.scheduledToday === 0;

  return (
    <HomeAreaCardShell
      title="Hábitos"
      icon={AutorenewRoundedIcon}
      status={isLoading ? 'loading' : result.status}
      isEmpty={isEmpty}
      emptyMessage="Nenhum hábito programado hoje."
      actionLabel="Abrir Hábitos"
      onOpen={onOpen}
    >
      {data ? (
        <>
          <Typography variant="body1">
            {data.completedToday} de {data.scheduledToday} registrados
          </Typography>
          {data.next ? (
            <Typography variant="caption" component="p" sx={{ mt: 0.25 }}>
              Próximo: {data.next.name}
            </Typography>
          ) : data.nextRoutine ? (
            <Typography variant="caption" component="p" sx={{ mt: 0.25 }}>
              Próxima rotina: {data.nextRoutine.name}
            </Typography>
          ) : null}
        </>
      ) : null}
    </HomeAreaCardShell>
  );
}
