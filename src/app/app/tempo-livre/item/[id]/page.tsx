import type { Metadata } from 'next';

import { LeisureItemDetailPage } from '@/features/leisure/components/LeisureItemDetailPage/LeisureItemDetailPage';

export const metadata: Metadata = {
  title: 'Item',
};

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LeisureItemDetailPage itemId={id} />;
}
