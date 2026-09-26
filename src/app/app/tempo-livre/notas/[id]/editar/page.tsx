import type { Metadata } from 'next';

import { NoteEditPage } from '@/features/leisure/components/NoteEditPage/NoteEditPage';

export const metadata: Metadata = {
  title: 'Editar nota',
};

export default async function EditarNotaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NoteEditPage noteId={id} />;
}
