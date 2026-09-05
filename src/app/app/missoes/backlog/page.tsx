import { BacklogMissionsPage } from '@/features/missions/components/BacklogMissionsPage/BacklogMissionsPage';

export const metadata = {
  title: 'Backlog | Missões | Kokyu',
  description: 'Missões organizadas, ainda sem compromisso temporal.',
};

export default function MissoesBacklogPage() {
  return <BacklogMissionsPage />;
}
