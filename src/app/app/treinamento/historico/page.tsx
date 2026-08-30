import type { Metadata } from 'next';

import { TrainingHistoryPage } from '@/features/training/components/TrainingHistoryPage/TrainingHistoryPage';

export const metadata: Metadata = {
  title: 'Histórico — Treinamento',
};

export default function HistoricoPage() {
  return <TrainingHistoryPage />;
}
