import type { Metadata } from 'next';

import { NotesPage } from '@/features/leisure/components/NotesPage/NotesPage';

export const metadata: Metadata = {
  title: 'Notas',
};

export default function NotasPage() {
  return <NotesPage />;
}
