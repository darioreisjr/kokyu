import type { Metadata } from 'next';

import { GoalsInProgressPage } from '@/features/goals/components/GoalsInProgressPage/GoalsInProgressPage';

export const metadata: Metadata = {
  title: 'Metas em andamento',
};

export default function EmAndamentoPage() {
  return <GoalsInProgressPage />;
}
