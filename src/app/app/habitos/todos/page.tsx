import { AllHabitsPage } from '@/features/habits/components/AllHabitsPage/AllHabitsPage';

export const metadata = {
  title: 'Todos os Hábitos | Kokyu',
  description: 'Gerencie todos os hábitos ativos e acompanhados no Kokyu.',
};

export default function TodosHabitosPage() {
  return <AllHabitsPage />;
}
