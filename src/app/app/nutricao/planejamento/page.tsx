import type { Metadata } from 'next';

import { PlannerPage } from '@/features/nutrition/components/PlannerPage/PlannerPage';

export const metadata: Metadata = {
  title: 'Planejamento',
};

export default function PlanejamentoPage() {
  return <PlannerPage />;
}
