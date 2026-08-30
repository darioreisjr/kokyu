import type { Metadata } from 'next';

import { RecipesPage } from '@/features/nutrition/components/RecipesPage/RecipesPage';

export const metadata: Metadata = {
  title: 'Receitas',
};

export default function ReceitasPage() {
  return <RecipesPage />;
}
