import { HabitCalendarPage } from '@/features/habits/components/HabitCalendarPage/HabitCalendarPage';

export const metadata = {
  title: 'Calendário de Hábitos | Kokyu',
  description: 'Visão mensal e histórico detalhado de execução de hábitos no Kokyu.',
};

export default function CalendarioHabitosPage() {
  return <HabitCalendarPage />;
}
