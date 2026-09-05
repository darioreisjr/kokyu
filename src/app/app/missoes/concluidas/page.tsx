import { CompletedMissionsPage } from '@/features/missions/components/CompletedMissionsPage/CompletedMissionsPage';

export const metadata = {
  title: 'Concluídas | Missões | Kokyu',
  description: 'Histórico de missões concluídas.',
};

export default function MissoesConcluidasPage() {
  return <CompletedMissionsPage />;
}
