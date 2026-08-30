import type { Metadata } from 'next';

import { PantryPage } from '@/features/nutrition/components/PantryPage/PantryPage';

export const metadata: Metadata = {
  title: 'Despensa',
};

export default function DespensaPage() {
  return <PantryPage />;
}
