import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import Typography from '@mui/material/Typography';
import type { HomeProviderResult, NutritionHomeProjection } from '@/shared/home/types';
import { HomeAreaCardShell } from '../HomeAreaCardShell/HomeAreaCardShell';

export interface HomeNutritionSummaryProps {
  result: HomeProviderResult<NutritionHomeProjection>;
  isLoading?: boolean;
  onOpen: () => void;
}

export function HomeNutritionSummary({ result, isLoading = false, onOpen }: HomeNutritionSummaryProps) {
  const data = result.data;
  const isEmpty = data !== null && data.plannedMealsToday === 0;

  return (
    <HomeAreaCardShell
      title="Nutrição"
      icon={RestaurantRoundedIcon}
      status={isLoading ? 'loading' : result.status}
      isEmpty={isEmpty}
      emptyMessage="Nenhuma refeição planejada hoje."
      actionLabel="Abrir Nutrição"
      onOpen={onOpen}
    >
      {data ? (
        <>
          {data.nextMeal ? (
            <Typography variant="body1">
              {data.nextMeal.mealTypeName}
              {data.nextMeal.time ? ` às ${data.nextMeal.time}` : ''}
            </Typography>
          ) : (
            <Typography variant="body1">Refeições do dia concluídas</Typography>
          )}
          <Typography variant="caption" component="p" sx={{ mt: 0.25 }}>
            {data.plannedMealsToday} refeições planejadas
          </Typography>
        </>
      ) : null}
    </HomeAreaCardShell>
  );
}
