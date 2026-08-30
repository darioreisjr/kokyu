import type { Metadata } from 'next';

import { RoutinesPage } from '@/features/training/components/RoutinesPage/RoutinesPage';

export const metadata: Metadata = {
  title: 'Meus treinos — Treinamento',
};

export default function TreinosPage() {
  return <RoutinesPage />;
}
