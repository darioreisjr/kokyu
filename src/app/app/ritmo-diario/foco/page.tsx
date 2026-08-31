import type { Metadata } from 'next';
import { FocusModeView } from '@/features/daily-rhythm';

export const metadata: Metadata = {
  title: 'Modo de Foco — Ritmo Diário — Kokyu',
  description: 'Concentre-se em uma única atividade com timer sem distrações.',
};

export default function FocoPage() {
  return <FocusModeView />;
}

