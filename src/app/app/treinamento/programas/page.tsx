import type { Metadata } from 'next';

import { ProgramsPage } from '@/features/training/components/ProgramsPage/ProgramsPage';

export const metadata: Metadata = {
  title: 'Programas — Treinamento',
};

export default function ProgramasPage() {
  return <ProgramsPage />;
}
