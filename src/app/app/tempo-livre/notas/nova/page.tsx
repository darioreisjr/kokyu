import type { Metadata } from 'next';

import { NoteFormPage } from '@/features/leisure/components/NoteFormPage/NoteFormPage';

export const metadata: Metadata = {
  title: 'Nova nota',
};

export default function NovaNotaPage() {
  return <NoteFormPage mode="create" />;
}
