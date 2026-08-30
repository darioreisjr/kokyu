import type { Metadata } from 'next';

import { ProgramFormPage } from '@/features/training/components/ProgramFormPage/ProgramFormPage';

export const metadata: Metadata = {
  title: 'Editar programa — Treinamento',
};

export default async function EditarProgramaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProgramFormPage mode="edit" programId={id} />;
}
