import type { Metadata } from 'next';
import Typography from '@mui/material/Typography';

export const metadata: Metadata = {
  title: 'Respiração',
};

export default function RespiracaoPage() {
  return (
    <Typography variant="displaySmall" component="h1">
      Respiração
    </Typography>
  );
}
