import type { Metadata } from 'next';

import { GoalsPlanningPage } from '@/features/goals/components/GoalsPlanningPage/GoalsPlanningPage';

export const metadata: Metadata = {
  title: 'Planejamento de metas',
};

export default function PlanejamentoPage() {
  return <GoalsPlanningPage />;
}
