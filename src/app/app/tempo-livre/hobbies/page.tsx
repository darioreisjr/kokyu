import type { Metadata } from 'next';

import { HobbiesPage } from '@/features/leisure/components/HobbiesPage/HobbiesPage';

export const metadata: Metadata = {
  title: 'Hobbies',
};

export default function HobbiesRoutePage() {
  return <HobbiesPage />;
}
