import type { Metadata } from 'next';

import { HobbyFormPage } from '@/features/leisure/components/HobbyFormPage/HobbyFormPage';

export const metadata: Metadata = {
  title: 'Novo hobby',
};

export default function NovoHobbyPage() {
  return <HobbyFormPage />;
}
