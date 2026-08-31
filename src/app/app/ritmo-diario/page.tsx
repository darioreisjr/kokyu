import type { Metadata } from 'next';
import { TodayTimelinePage } from '@/features/daily-rhythm';

export const metadata: Metadata = {
  title: 'Ritmo Diário — Kokyu',
  description: 'Veja seu dia inteiro e ajuste seu ritmo quando os planos mudarem.',
};

export default function RitmoDiarioPage() {
  return <TodayTimelinePage />;
}
