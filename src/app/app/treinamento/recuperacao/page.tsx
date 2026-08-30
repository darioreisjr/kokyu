import type { Metadata } from 'next';

import { RecoveryPage } from '@/features/training/components/RecoveryPage/RecoveryPage';

export const metadata: Metadata = {
  title: 'Recuperação — Treinamento',
};

export default function RecuperacaoPage() {
  return <RecoveryPage />;
}
