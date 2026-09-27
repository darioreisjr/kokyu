import type { Metadata } from 'next';

import { LeisureItemEditPage } from '@/features/leisure/components/LeisureItemEditPage/LeisureItemEditPage';

export const metadata: Metadata = {
  title: 'Editar item',
};

export default async function EditarItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LeisureItemEditPage itemId={id} />;
}
