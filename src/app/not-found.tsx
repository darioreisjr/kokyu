import type { Metadata } from 'next';

import { NotFoundPage } from '@/features/error-pages';

export const metadata: Metadata = {
  title: 'Página não encontrada',
};

export default function NotFound() {
  return <NotFoundPage />;
}
