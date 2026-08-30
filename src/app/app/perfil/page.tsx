import type { Metadata } from 'next';

import { ProfilePage } from '@/features/profile';

export const metadata: Metadata = {
  title: 'Perfil',
};

export default function PerfilPage() {
  return <ProfilePage />;
}
