import type { Metadata } from 'next';

import { TodayPage } from '@/features/nutrition/components/TodayPage/TodayPage';

export const metadata: Metadata = {
  title: 'Nutrição',
};

export default function NutricaoPage() {
  return <TodayPage />;
}
