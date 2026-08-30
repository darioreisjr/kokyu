import type { Metadata } from 'next';

import { RoutineFormPage } from '@/features/training/components/RoutineFormPage/RoutineFormPage';

export const metadata: Metadata = {
  title: 'Editar treino — Treinamento',
};

export default async function EditarTreinoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RoutineFormPage mode="edit" routineId={id} />;
}
