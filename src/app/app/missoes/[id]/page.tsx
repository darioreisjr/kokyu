import { MissionDetailPage } from '@/features/missions/components/MissionDetailPage/MissionDetailPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MissoesDetalhePage({ params }: PageProps) {
  const { id } = await params;
  return <MissionDetailPage missionId={id} />;
}
