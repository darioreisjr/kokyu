import Stack from '@mui/material/Stack';
import type { ReactNode } from 'react';

import { LeisureTabs } from '@/features/leisure/components/LeisureTabs/LeisureTabs';

/**
 * Shared by every `/app/tempo-livre/*` route — the internal tab bar,
 * kept out of each page so it survives navigation between them
 * without a layout shift. Each page still renders its own title/
 * description; this layout owns navigation only.
 */
export default function TempoLivreLayout({ children }: { children: ReactNode }) {
  return (
    <Stack spacing={4}>
      <LeisureTabs />
      {children}
    </Stack>
  );
}
