import type { Metadata } from 'next';

import { TodayPage } from '@/features/leisure/components/TodayPage/TodayPage';

export const metadata: Metadata = {
  title: 'Tempo Livre',
};

export default function TempoLivrePage() {
  return <TodayPage />;
}
