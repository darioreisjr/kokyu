import { redirect } from 'next/navigation';
import { habitRoutes } from '@/features/habits/constants/habitRoutes';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RoutineDetailPage({ params }: PageProps) {
  const { id } = await params;
  redirect(habitRoutes.routinePlayer(id));
}
