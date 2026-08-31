import type { Metadata } from 'next';
import { InboxView } from '@/features/daily-rhythm';

export const metadata: Metadata = {
  title: 'Caixa de Entrada — Ritmo Diário — Kokyu',
  description: 'Captura rápida de ideias e compromissos.',
};

export default function InboxPage() {
  return <InboxView />;
}

