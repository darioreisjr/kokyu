import type { Metadata } from 'next';

import { PlanEntryFormPage } from '@/features/leisure/components/PlanEntryFormPage/PlanEntryFormPage';

export const metadata: Metadata = {
  title: 'Planejar atividade',
};

export default async function NovoPlanejamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  return <PlanEntryFormPage mode="create" defaultDate={date} />;
}
