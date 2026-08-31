import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { DailyRhythmTabs } from '@/features/daily-rhythm';

export interface DailyRhythmLayoutProps {
  children: ReactNode;
}

export default function DailyRhythmLayout({ children }: DailyRhythmLayoutProps) {
  return (
    <Box sx={{ width: '100%', minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="xl" sx={{ pt: 2, pb: 1 }}>
        <DailyRhythmTabs />
        {children}
      </Container>
    </Box>
  );
}

