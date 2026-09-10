import type { Metadata } from 'next';

import { PlanEntryEditPage } from '@/features/leisure/components/PlanEntryEditPage/PlanEntryEditPage';

export const metadata: Metadata = {
  title: 'Editar planejamento',
};

export default async function EditarPlanejamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PlanEntryEditPage planEntryId={id} />;
}
