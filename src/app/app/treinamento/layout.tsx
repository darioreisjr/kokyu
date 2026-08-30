import type { ReactNode } from 'react';
import Stack from '@mui/material/Stack';

import { TrainingSessionProvider } from '@/features/training/providers/TrainingSessionProvider';
import { TrainingTabs } from '@/features/training/components/TrainingTabs/TrainingTabs';

/** `TrainingTabs` renders `null` on `/sessao/*` — kept out of each page so it survives navigation without a layout shift, same convention as `nutricao`/`tempo-livre`. */
export default function TreinamentoLayout({ children }: { children: ReactNode }) {
  return (
    <TrainingSessionProvider>
      <Stack spacing={4}>
        <TrainingTabs />
        {children}
      </Stack>
    </TrainingSessionProvider>
  );
}
