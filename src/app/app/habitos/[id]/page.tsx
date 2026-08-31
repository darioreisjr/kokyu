import { HabitDetailPage } from '@/features/habits/components/HabitDetailPage/HabitDetailPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetalhesHabitoPage({ params }: PageProps) {
  const { id } = await params;
  return <HabitDetailPage habitId={id} />;
}
