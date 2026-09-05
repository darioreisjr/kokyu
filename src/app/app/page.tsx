import type { Metadata } from 'next';
import { RespirationPage } from '@/features/home';

export const metadata: Metadata = {
  title: 'Respiração — Kokyu',
  description: 'Veja onde está seu ritmo agora.',
};

export default function RespiracaoPage() {
  return <RespirationPage />;
}
