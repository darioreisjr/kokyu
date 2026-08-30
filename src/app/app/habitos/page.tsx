import type { Metadata } from 'next';
import Typography from '@mui/material/Typography';

export const metadata: Metadata = {
  title: 'Hábitos',
};

export default function HabitosPage() {
  return (
    <Typography variant="displaySmall" component="h1">
      Hábitos
    </Typography>
  );
}
