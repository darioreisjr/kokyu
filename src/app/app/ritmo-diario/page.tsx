import type { Metadata } from 'next';
import Typography from '@mui/material/Typography';

export const metadata: Metadata = {
  title: 'Ritmo Diário',
};

export default function RitmoDiarioPage() {
  return (
    <Typography variant="displaySmall" component="h1">
      Ritmo Diário
    </Typography>
  );
}
