import type { Metadata } from 'next';

import { GoalsHistoryPage } from '@/features/goals/components/GoalsHistoryPage/GoalsHistoryPage';

export const metadata: Metadata = {
  title: 'Histórico de metas',
};

export default function HistoricoPage() {
  return <GoalsHistoryPage />;
}
