import { RoutinePlayerContainer } from '@/features/habits/components/RoutinePlayer/RoutinePlayerContainer';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExecutarRotinaPage({ params }: PageProps) {
  const { id } = await params;
  return <RoutinePlayerContainer routineId={id} />;
}
