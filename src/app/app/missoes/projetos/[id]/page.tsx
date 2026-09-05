import { ProjectDetailPage } from '@/features/missions/components/ProjectDetailPage/ProjectDetailPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MissoesProjetoDetalhePage({ params }: PageProps) {
  const { id } = await params;
  return <ProjectDetailPage projectId={id} />;
}
