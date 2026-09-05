import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type {
  GoalHomeProjection,
  HabitHomeProjection,
  HomeProviderResult,
  LeisureHomeProjection,
  MissionHomeProjection,
  NutritionHomeProjection,
  TrainingHomeProjection,
} from '@/shared/home/types';
import { HomeGoalSummary } from '../HomeGoalSummary/HomeGoalSummary';
import { HomeHabitSummary } from '../HomeHabitSummary/HomeHabitSummary';
import { HomeLeisureSummary } from '../HomeLeisureSummary/HomeLeisureSummary';
import { HomeMissionSummary } from '../HomeMissionSummary/HomeMissionSummary';
import { HomeNutritionSummary } from '../HomeNutritionSummary/HomeNutritionSummary';
import { HomeTrainingSummary } from '../HomeTrainingSummary/HomeTrainingSummary';

export interface HomeAreasGridProps {
  missions: HomeProviderResult<MissionHomeProjection>;
  habits: HomeProviderResult<HabitHomeProjection>;
  training: HomeProviderResult<TrainingHomeProjection>;
  nutrition: HomeProviderResult<NutritionHomeProjection>;
  goals: HomeProviderResult<GoalHomeProjection>;
  leisure: HomeProviderResult<LeisureHomeProjection>;
  isLoading?: boolean;
  onOpen: (href: string) => void;
}

/** "Áreas de hoje" — six compact cards, never full-size dashboards (see spec's "CARD DENSITY"). */
export function HomeAreasGrid({
  missions,
  habits,
  training,
  nutrition,
  goals,
  leisure,
  isLoading = false,
  onOpen,
}: HomeAreasGridProps) {
  return (
    <>
      <Typography variant="h6" component="h2" sx={{ mb: 1.5 }}>
        Áreas de hoje
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <HomeMissionSummary result={missions} isLoading={isLoading} onOpen={() => onOpen('/app/missoes')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <HomeHabitSummary result={habits} isLoading={isLoading} onOpen={() => onOpen('/app/habitos')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <HomeTrainingSummary result={training} isLoading={isLoading} onOpen={() => onOpen('/app/treinamento')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <HomeNutritionSummary result={nutrition} isLoading={isLoading} onOpen={() => onOpen('/app/nutricao')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <HomeGoalSummary result={goals} isLoading={isLoading} onOpen={() => onOpen('/app/metas')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <HomeLeisureSummary result={leisure} isLoading={isLoading} onOpen={() => onOpen('/app/tempo-livre')} />
        </Grid>
      </Grid>
    </>
  );
}
