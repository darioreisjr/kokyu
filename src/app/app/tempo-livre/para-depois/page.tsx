import type { Metadata } from 'next';

import { LaterPage } from '@/features/leisure/components/LaterPage/LaterPage';

export const metadata: Metadata = {
  title: 'Para depois',
};

export default function ParaDepoisPage() {
  return <LaterPage />;
}
