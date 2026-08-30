import type { Metadata } from 'next';

import { ShoppingPage } from '@/features/nutrition/components/ShoppingPage/ShoppingPage';

export const metadata: Metadata = {
  title: 'Compras',
};

export default function ComprasPage() {
  return <ShoppingPage />;
}
