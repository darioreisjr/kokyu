import type { Metadata } from 'next';

import { GoalsCompletedPage } from '@/features/goals/components/GoalsCompletedPage/GoalsCompletedPage';

export const metadata: Metadata = {
  title: 'Metas concluídas',
};

export default function ConcluidasPage() {
  return <GoalsCompletedPage />;
}
