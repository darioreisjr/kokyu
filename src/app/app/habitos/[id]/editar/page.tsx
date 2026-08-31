import { HabitEditPage } from '@/features/habits/components/HabitEditPage/HabitEditPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarHabitoPage({ params }: PageProps) {
  const { id } = await params;
  return <HabitEditPage habitId={id} />;
}
