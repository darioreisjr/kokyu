import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { HabitTabs } from '@/features/habits/components/HabitTabs/HabitTabs';

export interface HabitsLayoutProps {
  children: ReactNode;
}

export default function HabitsLayout({ children }: HabitsLayoutProps) {
  return (
    <Box sx={{ width: '100%', minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="lg" sx={{ pt: 2, pb: 1 }}>
        <HabitTabs />
      </Container>
      {children}
    </Box>
  );
}
