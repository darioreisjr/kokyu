import type { Metadata } from 'next';

import { EditRecipePage } from '@/features/nutrition/components/EditRecipePage/EditRecipePage';

export const metadata: Metadata = {
  title: 'Editar receita',
};

export default async function EditarReceitaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditRecipePage recipeId={id} />;
}
