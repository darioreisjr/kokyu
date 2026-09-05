import { NewMissionPage } from '@/features/missions/components/NewMissionPage/NewMissionPage';

export const metadata = {
  title: 'Nova missão | Kokyu',
  description: 'Crie uma nova missão no Kokyu.',
};

export default function MissoesNovaPage() {
  return <NewMissionPage />;
}
