import type { Metadata } from 'next';

import { NewRecipePage } from '@/features/nutrition/components/NewRecipePage/NewRecipePage';

export const metadata: Metadata = {
  title: 'Nova receita',
};

export default function NovaReceitaPage() {
  return <NewRecipePage />;
}
