import type { Metadata } from 'next';

import { RoutineFormPage } from '@/features/training/components/RoutineFormPage/RoutineFormPage';

export const metadata: Metadata = {
  title: 'Novo treino — Treinamento',
};

export default function NovoTreinoPage() {
  return <RoutineFormPage mode="create" />;
}
