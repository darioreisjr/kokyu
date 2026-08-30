import type { Metadata } from 'next';

import { LibraryPage } from '@/features/leisure/components/LibraryPage/LibraryPage';

export const metadata: Metadata = {
  title: 'Biblioteca',
};

export default function BibliotecaPage() {
  return <LibraryPage />;
}
