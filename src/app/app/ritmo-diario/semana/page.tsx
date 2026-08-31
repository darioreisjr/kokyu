import type { Metadata } from 'next';
import { WeeklyView } from '@/features/daily-rhythm';

export const metadata: Metadata = {
  title: 'Semana — Ritmo Diário — Kokyu',
  description: 'Visão semanal do seu ritmo e planejamento.',
};

export default function SemanaPage() {
  return <WeeklyView />;
}

