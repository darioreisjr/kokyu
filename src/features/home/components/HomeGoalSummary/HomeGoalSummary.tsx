import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { GoalHomeProjection, HomeProviderResult } from '@/shared/home/types';
import { HomeAreaCardShell } from '../HomeAreaCardShell/HomeAreaCardShell';

export interface HomeGoalSummaryProps {
  result: HomeProviderResult<GoalHomeProjection>;
  isLoading?: boolean;
  onOpen: () => void;
}

export function HomeGoalSummary({ result, isLoading = false, onOpen }: HomeGoalSummaryProps) {
  const data = result.data;
  const isEmpty = data !== null && data.inFocus.length === 0;

  return (
    <HomeAreaCardShell
      title="Metas"
      icon={TrackChangesRoundedIcon}
      status={isLoading ? 'loading' : result.status}
      isEmpty={isEmpty}
      emptyMessage="Nenhuma meta em foco."
      actionLabel="Abrir Metas"
      onOpen={onOpen}
    >
      {data ? (
        <Stack spacing={0.75}>
          {data.inFocus.slice(0, 2).map((goal) => (
            <Stack key={goal.id} spacing={0.25}>
              <Typography variant="body1" noWrap>
                {goal.title}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, goal.progressPercent)}
                sx={{ height: 4, borderRadius: 2 }}
              />
            </Stack>
          ))}
        </Stack>
      ) : null}
    </HomeAreaCardShell>
  );
}
