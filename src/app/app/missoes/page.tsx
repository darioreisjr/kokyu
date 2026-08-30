import type { Metadata } from 'next';
import Typography from '@mui/material/Typography';

export const metadata: Metadata = {
  title: 'Missões',
};

export default function MissoesPage() {
  return (
    <Typography variant="displaySmall" component="h1">
      Missões
    </Typography>
  );
}
