import type { Metadata } from 'next';

import { PlacesPage } from '@/features/leisure/components/PlacesPage/PlacesPage';

export const metadata: Metadata = {
  title: 'Lugares & Passeios',
};

export default function LugaresPage() {
  return <PlacesPage />;
}
