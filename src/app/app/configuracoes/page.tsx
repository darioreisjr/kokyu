import type { Metadata } from 'next';

import { SettingsPage } from '@/features/settings/components/SettingsPage/SettingsPage';

export const metadata: Metadata = {
  title: 'Configurações',
};

export default function ConfiguracoesPage() {
  return <SettingsPage />;
}
