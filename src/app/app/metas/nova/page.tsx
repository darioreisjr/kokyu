import type { Metadata } from 'next';

import { GoalFormPage } from '@/features/goals/components/GoalFormPage/GoalFormPage';

export const metadata: Metadata = {
  title: 'Nova meta',
};

export default function NovaMetaPage() {
  return <GoalFormPage mode="create" />;
}
