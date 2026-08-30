import type { Metadata } from 'next';

import { TrainingTodayPage } from '@/features/training/components/TrainingTodayPage/TrainingTodayPage';

export const metadata: Metadata = {
  title: 'Treinamento',
};

export default function TreinamentoPage() {
  return <TrainingTodayPage />;
}
