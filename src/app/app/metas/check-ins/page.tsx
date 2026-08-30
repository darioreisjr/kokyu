import type { Metadata } from 'next';

import { GoalsCheckInsPage } from '@/features/goals/components/GoalsCheckInsPage/GoalsCheckInsPage';

export const metadata: Metadata = {
  title: 'Check-ins de metas',
};

export default function CheckInsPage() {
  return <GoalsCheckInsPage />;
}
