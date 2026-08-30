import type { Metadata } from 'next';

import { HistoryPage } from '@/features/leisure/components/HistoryPage/HistoryPage';

export const metadata: Metadata = {
  title: 'Histórico',
};

export default function HistoricoPage() {
  return <HistoryPage />;
}
