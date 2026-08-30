import type { Metadata } from 'next';

import { GoalsOverviewPage } from '@/features/goals/components/GoalsOverviewPage/GoalsOverviewPage';

export const metadata: Metadata = {
  title: 'Metas',
};

export default function MetasPage() {
  return <GoalsOverviewPage />;
}
