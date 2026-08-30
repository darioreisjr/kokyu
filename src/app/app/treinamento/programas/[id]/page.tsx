import type { Metadata } from 'next';

import { ProgramDetailPage } from '@/features/training/components/ProgramDetailPage/ProgramDetailPage';

export const metadata: Metadata = {
  title: 'Programa — Treinamento',
};

export default async function ProgramaDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProgramDetailPage programId={id} />;
}
