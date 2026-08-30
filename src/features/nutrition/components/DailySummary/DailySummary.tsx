'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { themePalette } from '@/design-system/theme/useThemePalette';

export interface DailySummaryProps {
  plannedCount: number;
  totalSlots: number;
  missingIngredientsCount: number;
  nextMeal?: { label: string; time?: string };
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <Stack spacing={0.25}>
      <Typography
        variant="body2"
        sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
      >
        {label}
      </Typography>
      <Typography variant="labelLarge">{value}</Typography>
    </Stack>
  );
}

/**
 * A short contextual strip, not a dashboard — exactly the three
 * numbers the spec asks for, nothing more elaborate stacked on top.
 */
export function DailySummary({
  plannedCount,
  totalSlots,
  missingIngredientsCount,
  nextMeal,
}: DailySummaryProps) {
  return (
    <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap', rowGap: 2 }}>
      <SummaryStat label="Refeições planejadas" value={`${plannedCount} de ${totalSlots}`} />
      <SummaryStat
        label="Ingredientes faltando"
        value={missingIngredientsCount === 1 ? '1 item' : `${missingIngredientsCount} itens`}
      />
      {nextMeal ? (
        <SummaryStat
          label="Próxima refeição"
          value={nextMeal.time ? `${nextMeal.label} - ${nextMeal.time}` : nextMeal.label}
        />
      ) : null}
    </Stack>
  );
}
