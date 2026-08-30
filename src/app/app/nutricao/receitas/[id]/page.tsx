import type { Metadata } from 'next';

import { RecipeDetailPage } from '@/features/nutrition/components/RecipeDetailPage/RecipeDetailPage';

export const metadata: Metadata = {
  title: 'Receita',
};

export default async function ReceitaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RecipeDetailPage recipeId={id} />;
}
