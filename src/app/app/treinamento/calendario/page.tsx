import type { Metadata } from 'next';

import { TrainingCalendarPage } from '@/features/training/components/TrainingCalendarPage/TrainingCalendarPage';

export const metadata: Metadata = {
  title: 'Calendário — Treinamento',
};

export default function CalendarioPage() {
  return <TrainingCalendarPage />;
}
