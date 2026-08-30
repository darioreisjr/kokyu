import type { Metadata } from 'next';

import { ExerciseLibraryPage } from '@/features/training/components/ExerciseLibraryPage/ExerciseLibraryPage';

export const metadata: Metadata = {
  title: 'Exercícios — Treinamento',
};

export default function ExerciciosPage() {
  return <ExerciseLibraryPage />;
}
