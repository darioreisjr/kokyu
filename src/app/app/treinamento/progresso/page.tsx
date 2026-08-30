import type { Metadata } from 'next';

import { TrainingProgressPage } from '@/features/training/components/TrainingProgressPage/TrainingProgressPage';

export const metadata: Metadata = {
  title: 'Progresso — Treinamento',
};

export default function ProgressoPage() {
  return <TrainingProgressPage />;
}
