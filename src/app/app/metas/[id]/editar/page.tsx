import type { Metadata } from 'next';

import { GoalEditPage } from '@/features/goals/components/GoalEditPage/GoalEditPage';

export const metadata: Metadata = {
  title: 'Editar meta',
};

export default async function EditarMetaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GoalEditPage goalId={id} />;
}
