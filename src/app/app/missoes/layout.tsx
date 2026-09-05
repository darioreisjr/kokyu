import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { MissionTabs } from '@/features/missions/components/MissionTabs/MissionTabs';

export interface MissionsLayoutProps {
  children: ReactNode;
}

export default function MissionsLayout({ children }: MissionsLayoutProps) {
  return (
    <Box sx={{ width: '100%', minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="lg" sx={{ pt: 2, pb: 1 }}>
        <MissionTabs />
      </Container>
      {children}
    </Box>
  );
}
