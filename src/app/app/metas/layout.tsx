import Stack from '@mui/material/Stack';
import type { ReactNode } from 'react';

import { GoalTabs } from '@/features/goals/components/GoalTabs/GoalTabs';

/**
 * Shared by every `/app/metas/*` route — the internal tab bar, kept out of each page so it
 * survives navigation between them without a layout shift (same pattern as
 * `app/app/tempo-livre/layout.tsx`).
 */
export default function MetasLayout({ children }: { children: ReactNode }) {
  return (
    <Stack spacing={4}>
      <GoalTabs />
      {children}
    </Stack>
  );
}
