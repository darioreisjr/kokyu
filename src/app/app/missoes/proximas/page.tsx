import { UpcomingMissionsPage } from '@/features/missions/components/UpcomingMissionsPage/UpcomingMissionsPage';

export const metadata = {
  title: 'Próximas | Missões | Kokyu',
  description: 'Missões planejadas ou com prazo nos próximos dias.',
};

export default function MissoesProximasPage() {
  return <UpcomingMissionsPage />;
}
