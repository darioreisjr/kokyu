import type { Metadata } from 'next';

import { ActiveWorkoutPage } from '@/features/training/components/ActiveWorkoutPage/ActiveWorkoutPage';

export const metadata: Metadata = {
  title: 'Treino em andamento — Treinamento',
};

export default async function SessaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ActiveWorkoutPage sessionId={id} />;
}
