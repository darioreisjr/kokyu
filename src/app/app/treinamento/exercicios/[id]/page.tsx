import type { Metadata } from 'next';

import { ExerciseDetailPage } from '@/features/training/components/ExerciseDetailPage/ExerciseDetailPage';

export const metadata: Metadata = {
  title: 'Exercício — Treinamento',
};

export default async function ExercicioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ExerciseDetailPage exerciseId={id} />;
}
