import type { Metadata } from 'next';

import { ProgramFormPage } from '@/features/training/components/ProgramFormPage/ProgramFormPage';

export const metadata: Metadata = {
  title: 'Novo programa — Treinamento',
};

export default function NovoProgramaPage() {
  return <ProgramFormPage mode="create" />;
}
