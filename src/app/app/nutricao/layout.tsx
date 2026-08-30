import Stack from '@mui/material/Stack';
import type { ReactNode } from 'react';

import { NutritionTabs } from '@/features/nutrition/components/NutritionTabs/NutritionTabs';

/**
 * Shared by every `/app/nutricao/*` route — the internal tab bar,
 * kept out of each page so it survives navigation between them
 * without a layout shift. Each page still renders its own title/
 * description; this layout owns navigation only.
 */
export default function NutricaoLayout({ children }: { children: ReactNode }) {
  return (
    <Stack spacing={4}>
      <NutritionTabs />
      {children}
    </Stack>
  );
}
