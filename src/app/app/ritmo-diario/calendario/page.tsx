import type { Metadata } from 'next';
import { MonthlyCalendarView } from '@/features/daily-rhythm';

export const metadata: Metadata = {
  title: 'Calendário — Ritmo Diário — Kokyu',
  description: 'Visão mensal e panorama do seu ritmo.',
};

export default function CalendarioPage() {
  return <MonthlyCalendarView />;
}

