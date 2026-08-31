import type { Metadata } from 'next';
import { RoutinesView } from '@/features/daily-rhythm';

export const metadata: Metadata = {
  title: 'Rotinas e Modelos — Ritmo Diário — Kokyu',
  description: 'Modelos de dia para organizar sua rotina.',
};

export default function RotinasPage() {
  return <RoutinesView />;
}

