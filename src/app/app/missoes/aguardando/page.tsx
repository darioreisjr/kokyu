import { WaitingMissionsPage } from '@/features/missions/components/WaitingMissionsPage/WaitingMissionsPage';

export const metadata = {
  title: 'Aguardando | Missões | Kokyu',
  description: 'Missões que dependem de retorno externo.',
};

export default function MissoesAguardandoPage() {
  return <WaitingMissionsPage />;
}
