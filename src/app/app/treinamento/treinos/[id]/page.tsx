import type { Metadata } from 'next';

import { RoutineDetailPage } from '@/features/training/components/RoutineDetailPage/RoutineDetailPage';

export const metadata: Metadata = {
  title: 'Treino — Treinamento',
};

export default async function TreinoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RoutineDetailPage routineId={id} />;
}
