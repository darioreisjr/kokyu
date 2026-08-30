import type { Metadata } from 'next';

import { GoalDetailPage } from '@/features/goals/components/GoalDetailPage/GoalDetailPage';

export const metadata: Metadata = {
  title: 'Detalhes da meta',
};

export default async function MetaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GoalDetailPage goalId={id} />;
}
