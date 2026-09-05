import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import Typography from '@mui/material/Typography';
import type { HomeProviderResult, TrainingHomeProjection } from '@/shared/home/types';
import { HomeAreaCardShell } from '../HomeAreaCardShell/HomeAreaCardShell';

export interface HomeTrainingSummaryProps {
  result: HomeProviderResult<TrainingHomeProjection>;
  isLoading?: boolean;
  onOpen: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  planned: 'Planejado',
  completed: 'Concluído',
  skipped: 'Pulado',
  missed: 'Perdido',
  rest: 'Descanso',
};

export function HomeTrainingSummary({ result, isLoading = false, onOpen }: HomeTrainingSummaryProps) {
  const data = result.data;
  const isEmpty = data !== null && !data.today && !data.next;
  const entry = data?.today ?? data?.next ?? null;

  return (
    <HomeAreaCardShell
      title="Treinamento"
      icon={FitnessCenterRoundedIcon}
      status={isLoading ? 'loading' : result.status}
      isEmpty={isEmpty}
      emptyMessage="Nenhum treino planejado."
      actionLabel="Abrir Treinamento"
      onOpen={onOpen}
    >
      {entry ? (
        <>
          <Typography variant="body1">{entry.label}</Typography>
          <Typography variant="caption" component="p" sx={{ mt: 0.25 }}>
            {data?.today ? 'Hoje' : entry.date}
            {entry.time ? ` • ${entry.time}` : ''} • {STATUS_LABEL[entry.status] ?? entry.status}
          </Typography>
        </>
      ) : null}
    </HomeAreaCardShell>
  );
}
